/**
 * My Posts - Simplified CRUD operations
 * This file handles the My Posts page functionality with streamlined CRUD operations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the PostManager
  const postManager = new PostManager();
});

class PostManager {
  constructor() {
    // Check authentication
    this.token = localStorage.getItem('token');
    if (!this.token) {
      window.location.href = 'login.html';
      return;
    }
    
    // Initialize and load posts
    this.initElements();
    this.addEventListeners();
    this.loadPosts();
  }
  
  // Initialize DOM elements
  initElements() {
    this.postsContainer = document.getElementById('posts');
    this.postForm = document.getElementById('postForm');
    this.sortSelect = document.getElementById('sortPosts');
    this.formTitle = document.getElementById('formTitle');
    this.submitButton = document.getElementById('submitPost');
    this.createButton = document.getElementById('createPostBtn');
    this.cancelButton = document.getElementById('cancelPostBtn');
    this.logoutButton = document.getElementById('logoutBtn');
  }
  
  // Add event listeners
  addEventListeners() {
    this.createButton.addEventListener('click', () => this.showCreateForm());
    this.cancelButton.addEventListener('click', () => this.hideForm());
    this.postForm.addEventListener('submit', (e) => this.handleSubmit(e));
    this.sortSelect.addEventListener('change', () => this.loadPosts(this.sortSelect.value));
    this.logoutButton.addEventListener('click', () => this.logout());
  }
  
  // CRUD: READ - Load user's posts
  async loadPosts(sort = 'recent') {
    try {
      const response = await fetch(`/api/posts/my-posts?sort=${sort}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const posts = await response.json();
      this.renderPosts(posts);
    } catch (error) {
      this.showError('Failed to load posts', error);
    }
  }
  
  // Handle form submission for both create and update
  async handleSubmit(e) {
    e.preventDefault();
    this.submitButton.disabled = true;
    
    try {
      const formData = new FormData(this.postForm);
      const postId = this.postForm.dataset.postId;
      
      // Determine if this is a create or update operation
      if (postId) {
        await this.updatePost(postId, formData);
      } else {
        await this.createPost(formData);
      }
    } catch (error) {
      this.showError('Error submitting post', error);
    } finally {
      this.submitButton.disabled = false;
    }
  }
  
  // CRUD: CREATE - Create a new post
  async createPost(formData) {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      await this.loadPosts();
      this.hideForm();
    } catch (error) {
      this.showError('Failed to create post', error);
    }
  }
  
  // CRUD: UPDATE - Update an existing post
  async updatePost(postId, formData) {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      await this.loadPosts();
      this.hideForm();
    } catch (error) {
      this.showError('Failed to update post', error);
    }
  }
  
  // CRUD: DELETE - Delete a post
  async deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      await this.loadPosts();
    } catch (error) {
      this.showError('Failed to delete post', error);
    }
  }
  
  // Render posts to the DOM
  renderPosts(posts) {
    this.postsContainer.innerHTML = '';
    
    if (!posts || posts.length === 0) {
      this.postsContainer.innerHTML = '<p class="no-posts">No posts found</p>';
      return;
    }
    
    const template = document.getElementById('postTemplate');
    
    posts.forEach(post => {
      const postElement = template.content.cloneNode(true);
      const postDiv = postElement.querySelector('.post');
      
      // Set post data
      postDiv.dataset.postId = post._id;
      postDiv.classList.add(`post-${post.category?.toLowerCase() || 'general'}`);
      
      postDiv.querySelector('.post-title').textContent = post.title || 'Untitled';
      postDiv.querySelector('.post-date').textContent = new Date(post.timestamp || post.createdAt).toLocaleDateString();
      postDiv.querySelector('.post-category').textContent = post.category || 'General';
      postDiv.querySelector('.post-content').textContent = post.content || '';
      postDiv.querySelector('.upvote-count').textContent = post.upvotes?.length || 0;
      
      // Handle post image
      if (post.imageUrl) {
        const imgElement = postDiv.querySelector('.post-image');
        imgElement.src = post.imageUrl;
        imgElement.classList.remove('hidden');
        imgElement.onerror = () => imgElement.classList.add('hidden');
      }
      
      // Add event listeners for edit and delete
      postDiv.querySelector('.btn-edit').addEventListener('click', () => this.showEditForm(post));
      postDiv.querySelector('.btn-delete').addEventListener('click', () => this.deletePost(post._id));
      
      this.postsContainer.appendChild(postDiv);
    });
  }
  
  // Show the create post form
  showCreateForm() {
    this.resetForm();
    this.formTitle.textContent = 'Create Post';
    this.submitButton.textContent = 'Post';
    this.postForm.classList.remove('hidden');
  }
  
  // Show the edit post form
  showEditForm(post) {
    this.resetForm();
    
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postContent').value = post.content || '';
    document.getElementById('postCategory').value = post.category || 'General';
    
    this.postForm.dataset.postId = post._id;
    this.formTitle.textContent = 'Edit Post';
    this.submitButton.textContent = 'Update';
    this.postForm.classList.remove('hidden');
  }
  
  // Hide the form
  hideForm() {
    this.postForm.classList.add('hidden');
    this.resetForm();
  }
  
  // Reset the form
  resetForm() {
    this.postForm.reset();
    delete this.postForm.dataset.postId;
  }
  
  // Show error message
  showError(message, error) {
    console.error(`${message}:`, error);
    alert(`${message}: ${error.message}`);
  }
  
  // Logout user
  logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
}