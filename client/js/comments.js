class CommentService {
    constructor(token) {
        this.token = token;
    }

    async fetchComments(postId) {
        try {
            const response = await fetch('/api/posts', {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleUnauthorized();
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const posts = await response.json();
            const post = posts.find(p => p._id === postId);
            return post ? post.comments : [];
        } catch (error) {
            console.error('Error fetching comments:', error);
            return null;
        }
    }

    async createComment(postId, content) {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleUnauthorized();
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating comment:', error);
            return null;
        }
    }

    async deleteComment(postId, commentId) {
        try {
            const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleUnauthorized();
                    return false;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    }

    handleUnauthorized() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
}

class CommentUI {
    constructor(commentService) {
        this.commentService = commentService;
    }

    createCommentElement(comment, postId) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.setAttribute('data-comment-id', comment._id);

        const commentContent = document.createElement('div');
        commentContent.className = 'comment-content';

        const commentText = document.createElement('p');
        commentText.textContent = comment.content;

        const commentMeta = document.createElement('div');
        commentMeta.className = 'comment-meta';
        commentMeta.innerHTML = `
            <span class="comment-author">Anonymous</span>
            <span class="comment-date">${this.formatDate(comment.timestamp)}</span>
        `;

        // Add delete button for user's own comments
        const userId = this.getUserId();
        if (userId === comment.postedBy._id) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-comment-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => this.handleDeleteComment(postId, comment._id));
            commentMeta.appendChild(deleteBtn);
        }

        commentContent.appendChild(commentText);
        commentContent.appendChild(commentMeta);
        commentDiv.appendChild(commentContent);

        return commentDiv;
    }

    async displayComments(postId, commentsSection) {
        try {
            const comments = await this.commentService.fetchComments(postId);
            const commentsList = commentsSection.querySelector('.comments-list');
            commentsList.innerHTML = '';

            if (comments && comments.length > 0) {
                comments.forEach(comment => {
                    const commentElement = this.createCommentElement(comment, postId);
                    commentsList.appendChild(commentElement);
                });
            } else {
                commentsList.innerHTML = '<p class="no-comments">No comments yet</p>';
            }
        } catch (error) {
            console.error('Error displaying comments:', error);
            commentsSection.querySelector('.comments-list').innerHTML = 
                '<p class="error-message">Failed to load comments</p>';
        }
    }

    async handleCommentSubmission(postId, form) {
        const commentInput = form.querySelector('.comment-input');
        const submitBtn = form.querySelector('button[type="submit"]');
        const content = commentInput.value.trim();

        if (!content) return;

        submitBtn.disabled = true;

        try {
            const comment = await this.commentService.createComment(postId, content);
            
            if (comment) {
                const commentsSection = form.closest('.comments-section');
                const commentsList = commentsSection.querySelector('.comments-list');
                
                const noComments = commentsList.querySelector('.no-comments');
                if (noComments) {
                    noComments.remove();
                }

                const commentElement = this.createCommentElement(comment, postId);
                commentsList.appendChild(commentElement);

                // Update count
                const post = form.closest('.post');
                const commentCount = post.querySelector('.comment-count');
                const currentCount = parseInt(commentCount.textContent) || 0;
                commentCount.textContent = currentCount + 1;

                // Clear input
                commentInput.value = '';
            } else {
                this.showError(form, 'Failed to post comment. Please try again.');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showError(form, 'Failed to post comment. Please try again.');
        } finally {
            submitBtn.disabled = false;
        }
    }

    async handleDeleteComment(postId, commentId) {
        try {
            const success = await this.commentService.deleteComment(postId, commentId);
            
            if (success) {
                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                const post = commentElement.closest('.post');
                const commentCount = post.querySelector('.comment-count');
                const currentCount = parseInt(commentCount.textContent) || 0;
                
                commentElement.remove();
                commentCount.textContent = Math.max(0, currentCount - 1);

                const commentsSection = post.querySelector('.comments-section');
                const commentsList = commentsSection.querySelector('.comments-list');
                if (!commentsList.children.length) {
                    commentsList.innerHTML = '<p class="no-comments">No comments yet</p>';
                }
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    }

    showError(form, message) {
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);

        setTimeout(() => {
            if (errorDiv.parentNode === form) {
                errorDiv.remove();
            }
        }, 3000);
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }

    getUserId() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
}

// Export the classes
export { CommentService, CommentUI };