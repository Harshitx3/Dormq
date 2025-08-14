// Import API configuration
import { API_BASE_URL } from './api-config.js';

// Wait for DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', () => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize UI elements
    const searchInput = document.querySelector('#searchInput');
    const categoryButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.querySelector('#sortPosts');
    const postsContainer = document.querySelector('#posts');
    const askQuestionBtn = document.querySelector('.btn-create');
    const cancelBtn = document.querySelector('.btn-cancel');
    const postForm = document.querySelector('#postForm');

    // Global variables
    let currentCategory = 'all';
    let currentSort = 'recent';
    let allPosts = [];

    // Event Listeners
    searchInput?.addEventListener('input', (e) => performSearch(e.target.value));
    sortSelect?.addEventListener('change', (e) => handleSort(e.target.value));
    categoryButtons?.forEach(btn => {
        btn.addEventListener('click', () => handleCategoryFilter(btn.dataset.filter));
    });
    askQuestionBtn?.addEventListener('click', () => showPostForm());
    cancelBtn?.addEventListener('click', () => hidePostForm());
    
    // Post form category change event
    const postCategorySelect = document.querySelector('#postCategory');
    const reviewRating = document.querySelector('#reviewRating');
    const memeTools = document.querySelector('#memeTools');
    
    postCategorySelect?.addEventListener('change', (e) => {
        const category = e.target.value;
        if (category === 'review') {
            reviewRating.classList.remove('hidden');
        } else {
            reviewRating.classList.add('hidden');
        }
        
        if (category === 'meme') {
            memeTools.classList.remove('hidden');
        } else {
            memeTools.classList.add('hidden');
        }
    });
    
    // Submit post event
    const submitPostBtn = document.querySelector('#submitPost');
    submitPostBtn?.addEventListener('click', submitPost);

    // Check for post ID in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');
    
    // Load initial posts
    loadPosts(postId);

    // Functions
    async function loadPosts(specificPostId = null) {
        try {
            showLoading();
            const posts = await fetchPosts();
            allPosts = posts;
            
            if (specificPostId) {
                // If a specific post ID is provided, filter to show only that post
                const specificPost = posts.find(post => post._id === specificPostId);
                if (specificPost) {
                    // Display only the specific post
                    displayPosts([specificPost]);
                    
                    // Scroll to the post and highlight it
                    setTimeout(() => {
                        const postElement = document.querySelector(`.post[data-id="${specificPostId}"]`);
                        if (postElement) {
                            postElement.scrollIntoView({ behavior: 'smooth' });
                            postElement.classList.add('highlighted-post');
                            setTimeout(() => postElement.classList.remove('highlighted-post'), 3000);
                        }
                    }, 100);
                } else {
                    // If the specific post is not found, show all posts
                    displayPosts(posts);
                    showError('The requested post could not be found');
                }
            } else {
                // Display all posts normally
                displayPosts(posts);
            }
            
            hideLoading();
        } catch (error) {
            console.error('Error loading posts:', error);
            showError('Failed to load posts');
            hideLoading();
        }
    }

    async function fetchPosts() {
        try {
            // Import API_BASE_URL from api-config.js if not already imported
            const apiUrl = `${API_BASE_URL}/posts`; // Use API_BASE_URL from api-config.js
            const response = await fetch(apiUrl);

            if (response.status === 401) {
                handleUnauthorized();
                return [];
            }

            if (!response.ok) {
                let errorMsg = 'Failed to fetch posts';
                try {
                    const error = await response.json();
                    errorMsg = error.message || errorMsg;
                } catch (e) {
                    // If response is not JSON, keep default errorMsg
                }
                throw new Error(errorMsg);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    function displayPosts(posts) {
        if (!postsContainer) return;

        if (posts.length === 0) {
            postsContainer.innerHTML = '<div class="no-posts">No posts found</div>';
            return;
        }

        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostHTML(post);
            postsContainer.appendChild(postElement);
        });

        // Add event listeners to post actions
        addPostEventListeners();
    }

    function createPostHTML(post) {
        // Clone the template
        const template = document.querySelector('#postTemplate');
        const postElement = document.importNode(template.content, true);
        
        // Fill in the post data
        postElement.querySelector('.post-title').textContent = post.title;
        postElement.querySelector('.category-badge').textContent = post.category;
        postElement.querySelector('.post-author').textContent = `Posted by Anonymous`;
        postElement.querySelector('.post-timestamp').textContent = formatDate(post.timestamp || post.createdAt);
        postElement.querySelector('.post-content').textContent = post.content;
        
        // Handle rating if it exists
        if (post.rating) {
            const ratingElement = postElement.querySelector('.post-rating');
            ratingElement.textContent = `Rating: ${post.rating}/5`;
            ratingElement.classList.remove('hidden');
        }
        
        // Handle image if it exists
        const imageElement = postElement.querySelector('.post-image');
        if (post.imageUrl) {
            imageElement.src = post.imageUrl;
            imageElement.classList.remove('hidden');
        }
        
        // Set up vote counts
        postElement.querySelector('.upvote-count').textContent = post.upvotes?.length || 0;
        postElement.querySelector('.downvote-count').textContent = post.downvotes?.length || 0;
        
        // Set data attributes for actions
        const postDiv = postElement.querySelector('.post');
        postDiv.dataset.id = post._id;
        
        // Check if user has voted on this post and add active class
        if (token) {
            try {
                // Decode the token to get user ID
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    const userId = payload.userId;
                    
                    // Check if user has upvoted
                    if (post.upvotes && post.upvotes.includes(userId)) {
                        postElement.querySelector('.upvote').classList.add('active');
                    }
                    
                    // Check if user has downvoted
                    if (post.downvotes && post.downvotes.includes(userId)) {
                        postElement.querySelector('.downvote').classList.add('active');
                    }
                }
            } catch (error) {
                console.error('Error checking vote status:', error);
            }
        }
        
        return postDiv;
    }

    function addPostEventListeners() {
        // Upvote buttons
        document.querySelectorAll('.upvote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postElement = e.target.closest('.post');
                if (postElement) {
                    handleVote(postElement.dataset.id, 'upvote');
                }
            });
        });

        // Downvote buttons
        document.querySelectorAll('.downvote').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postElement = e.target.closest('.post');
                if (postElement) {
                    handleVote(postElement.dataset.id, 'downvote');
                }
            });
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postElement = e.target.closest('.post');
                if (postElement) {
                    sharePost(postElement.dataset.id);
                }
            });
        });
    }

    async function handleVote(postId, voteType) {
        try {
            // Check if user is logged in
            if (!token) {
                alert('Please log in to vote on posts');
                window.location.href = '/login.html';
                return;
            }
            
            // Get the post element and vote count elements
            const postElement = document.querySelector(`.post[data-id="${postId}"]`);
            if (!postElement) return;
            
            const upvoteBtn = postElement.querySelector('.upvote');
            const downvoteBtn = postElement.querySelector('.downvote');
            const upvoteCount = postElement.querySelector('.upvote-count');
            const downvoteCount = postElement.querySelector('.downvote-count');
            
            // Optimistically update UI
            if (voteType === 'upvote') {
                if (!upvoteBtn.classList.contains('active')) {
                    upvoteBtn.classList.add('active');
                    upvoteCount.textContent = parseInt(upvoteCount.textContent) + 1;
                    
                    // If downvote was active, remove it
                    if (downvoteBtn.classList.contains('active')) {
                        downvoteBtn.classList.remove('active');
                        downvoteCount.textContent = parseInt(downvoteCount.textContent) - 1;
                    }
                } else {
                    // Clicking active upvote removes it
                    upvoteBtn.classList.remove('active');
                    upvoteCount.textContent = parseInt(upvoteCount.textContent) - 1;
                }
            } else if (voteType === 'downvote') {
                if (!downvoteBtn.classList.contains('active')) {
                    downvoteBtn.classList.add('active');
                    downvoteCount.textContent = parseInt(downvoteCount.textContent) + 1;
                    
                    // If upvote was active, remove it
                    if (upvoteBtn.classList.contains('active')) {
                        upvoteBtn.classList.remove('active');
                        upvoteCount.textContent = parseInt(upvoteCount.textContent) - 1;
                    }
                } else {
                    // Clicking active downvote removes it
                    downvoteBtn.classList.remove('active');
                    downvoteCount.textContent = parseInt(downvoteCount.textContent) - 1;
                }
            }
            
            // Send request to server
            const response = await fetch(`${API_BASE_URL}/posts/vote/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ voteType })
            });

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to ${voteType}`);
            }
            
            // Get the updated post data to ensure UI is in sync with server
            const updatedPostData = await response.json();
            if (updatedPostData) {
                // Update vote counts with actual values from server
                upvoteCount.textContent = updatedPostData.upvotes?.length || 0;
                downvoteCount.textContent = updatedPostData.downvotes?.length || 0;
                
                // Update active state based on server response
                const userId = updatedPostData.currentUserId;
                const hasUpvoted = updatedPostData.upvotes && updatedPostData.upvotes.includes(userId);
                const hasDownvoted = updatedPostData.downvotes && updatedPostData.downvotes.includes(userId);
                
                upvoteBtn.classList.toggle('active', hasUpvoted);
                downvoteBtn.classList.toggle('active', hasDownvoted);
            }
        } catch (error) {
            console.error(`Error handling ${voteType}:`, error);
            showError(`Failed to ${voteType} post`);
            // Reload posts to reset UI state in case of error
            loadPosts();
        }
    }

    function handleCategoryFilter(category) {
        currentCategory = category;
        const filteredPosts = filterPosts(allPosts);
        displayPosts(filteredPosts);

        // Update active category button
        categoryButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
    }

    function handleSort(sortType) {
        currentSort = sortType;
        const filteredPosts = filterPosts(allPosts);
        displayPosts(filteredPosts);
    }

    function performSearch(searchTerm) {
        const filteredPosts = filterPosts(allPosts, searchTerm);
        displayPosts(filteredPosts);
    }

    function filterPosts(posts, searchTerm = '') {
        let filtered = [...posts];

        // Apply category filter
        if (currentCategory !== 'all') {
            filtered = filtered.filter(post => post.category.toLowerCase() === currentCategory.toLowerCase());
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(term) ||
                post.content.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        return sortPosts(filtered, currentSort);
    }

    function sortPosts(posts, sortType) {
        switch (sortType) {
            case 'recent':
                return posts.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
            case 'popular':
                return posts.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
            default:
                return posts;
        }
    }

    function showPostForm() {
        const postForm = document.querySelector('#postForm');
        const postsContent = document.querySelector('#postsContent');
        const createBtn = document.querySelector('.btn-create');
        const cancelBtn = document.querySelector('.btn-cancel');
        
        if (postForm && postsContent) {
            postForm.classList.remove('hidden');
            postsContent.classList.add('hidden');
            createBtn.style.display = 'none';
            cancelBtn.style.display = 'inline-block';
        }
    }
    
    function hidePostForm() {
        const postForm = document.querySelector('#postForm');
        const postsContent = document.querySelector('#postsContent');
        const createBtn = document.querySelector('.btn-create');
        const cancelBtn = document.querySelector('.btn-cancel');
        
        if (postForm && postsContent) {
            postForm.classList.add('hidden');
            postsContent.classList.remove('hidden');
            createBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'none';
            
            // Reset form
            document.querySelector('#postTitle').value = '';
            document.querySelector('#postContent').value = '';
            document.querySelector('#postCategory').value = 'general';
            document.querySelector('#imageInput').value = '';
            document.querySelector('#reviewRating').classList.add('hidden');
            document.querySelector('#memeTools').classList.add('hidden');
        }
    }
    
    async function submitPost() {
        try {
            // Check if user is logged in
            if (!token) {
                alert('Please log in to create posts');
                window.location.href = '/login.html';
                return;
            }
            
            const title = document.querySelector('#postTitle').value;
            const content = document.querySelector('#postContent').value;
            const category = document.querySelector('#postCategory').value;
            const imageInput = document.querySelector('#imageInput');
            
            if (!title || !content) {
                showError('Please fill in all required fields');
                return;
            }
            
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);
            
            // Add rating if it's a review
            if (category === 'review') {
                const rating = document.querySelector('#ratingSelect').value;
                formData.append('rating', rating);
            }
            
            // Add image if selected
            if (imageInput.files.length > 0) {
                formData.append('image', imageInput.files[0]);
            }
            
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create post');
            }
            
            // Reload posts and hide form
            await loadPosts();
            hidePostForm();
        } catch (error) {
            console.error('Error creating post:', error);
            showError(error.message || 'Failed to create post');
        }
    }
    
    function sharePost(postId) {
        // Get the post title from the DOM
        const postElement = document.querySelector(`.post[data-id="${postId}"]`);
        const postTitle = postElement ? postElement.querySelector('.post-title').textContent : 'Post';
        
        // Create the URL for the post
        const postUrl = `${window.location.origin}/community.html?post=${postId}`;
        
        // Try to use the Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: postTitle,
                text: `Check out this post: ${postTitle}`,
                url: postUrl
            })
            .then(() => console.log('Shared successfully'))
            .catch(error => {
                console.error('Error sharing:', error);
                fallbackShare(postUrl);
            });
        } else {
            // Fallback for browsers that don't support the Web Share API
            fallbackShare(postUrl);
        }
    }
    
    function fallbackShare(url) {
        // Create a temporary input element
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        
        // Select and copy the URL
        input.select();
        document.execCommand('copy');
        
        // Remove the temporary input
        document.body.removeChild(input);
        
        // Notify the user
        alert('Post URL copied to clipboard!');
    }

    // Utility Functions
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showError(message) {
        // Remove existing error messages first
        document.querySelectorAll('.error-message').forEach(e => e.remove());
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        postsContainer.insertAdjacentElement('beforebegin', errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    function showLoading() {
        if (!postsContainer) return;
        postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
    }

    function hideLoading() {
        const loadingDiv = postsContainer?.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    function handleUnauthorized() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }
});