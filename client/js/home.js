// Import API configuration
import { API_BASE_URL } from './api-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // QR Code Modal
    const modal = document.getElementById('qrModal');
    const closeBtn = document.getElementsByClassName('close')[0];

    window.showQRCode = () => {
        modal.style.display = 'block';
    }

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    }

    window.onclick = (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Post submission
    const submitPost = document.getElementById('submitPost');
    const postContent = document.getElementById('postContent');
    const imageInput = document.getElementById('imageInput');
    const postsContainer = document.getElementById('posts');

    submitPost.addEventListener('click', async () => {
        const content = postContent.value.trim();
        if (!content) return;

        const formData = new FormData();
        formData.append('content', content);
        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                postContent.value = '';
                imageInput.value = '';
                loadPosts();
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    });

    // Load posts
    async function loadPosts() {
        try {
            const response = await fetch(`${API_BASE_URL}/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const posts = await response.json();
            postsContainer.innerHTML = posts.map(post => `
                <div class="post">
                    <div class="post-header">
                        <h4>${post.postedBy}</h4>
                        <small>${new Date(post.timestamp).toLocaleString()}</small>
                    </div>
                    <p class="post-content">${post.content}</p>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post image">` : ''}
                    <div class="post-actions">
                        <button onclick="likePost('${post._id}')">
                            <i class="fas fa-heart"></i> ${post.likes}
                        </button>
                        <button onclick="showComments('${post._id}')">
                            <i class="fas fa-comment"></i> ${post.comments.length}
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    // Initial load of posts
    loadPosts();
});

// Add this function for mobile menu toggle
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});