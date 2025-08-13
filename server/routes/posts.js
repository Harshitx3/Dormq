const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: function(req, file, cb) {
        cb(null, 'post-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        // Don't try to access req.user.userId here as auth middleware isn't applied
        console.log('Fetching all posts');

        const posts = await Post.find().populate('postedBy', 'name');
        if (!posts) {
            return res.status(404).json({ message: 'No posts found' });
        }

        console.log('Found posts:', posts.length);

        const postsWithFullImageUrls = posts.map(post => {
            const postObj = post.toObject();
            if (postObj.imageUrl && !postObj.imageUrl.startsWith('/')) {
                postObj.imageUrl = `/uploads/${postObj.imageUrl}`;
            }
            // Always set username to Anonymous for privacy
            postObj.postedBy = { username: 'Anonymous' };
            console.log('Set anonymous username');
            return postObj;
        });

        console.log('Sending posts response');
        res.setHeader('Content-Type', 'application/json');
        res.json(postsWithFullImageUrls);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: error.message || 'Error fetching posts' });
    }
});

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, content, category, rating } = req.body;
        // Get postedBy from token if available, otherwise set to null
        let postedBy = null;
        if (req.user && req.user.userId) {
            postedBy = req.user.userId;
        }
        
        const post = new Post({
            title,
            content,
            category,
            rating: rating ? parseInt(rating) : undefined,
            postedBy: postedBy,
            imageUrl: req.file ? req.file.filename : undefined,
            upvotes: [],
            downvotes: []
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update post votes
router.put('/vote/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body;
        
        // Ensure user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        const userId = req.user.userId;

        if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({ message: 'Invalid vote type' });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (voteType === 'upvote') {
            // Toggle upvote
            if (post.upvotes.includes(userId)) {
                // Remove upvote if already upvoted
                post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
            } else {
                // Add upvote
                post.upvotes.push(userId);
                // Remove downvote if exists
                post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
            }
        } else if (voteType === 'downvote') {
            // Toggle downvote
            if (post.downvotes.includes(userId)) {
                // Remove downvote if already downvoted
                post.downvotes = post.downvotes.filter(id => id.toString() !== userId);
            } else {
                // Add downvote
                post.downvotes.push(userId);
                // Remove upvote if exists
                post.upvotes = post.upvotes.filter(id => id.toString() !== userId);
            }
        }

        // Save the updated post
        await post.save();
        
        // Return the updated post data with populated fields
        const updatedPost = await Post.findById(id).populate('postedBy', 'name');
        const postObj = updatedPost.toObject();
        
        // Format the response to match the GET endpoint format
        if (postObj.imageUrl && !postObj.imageUrl.startsWith('/')) {
            postObj.imageUrl = `/uploads/${postObj.imageUrl}`;
        }
        
        // Always set username to Anonymous for privacy
        postObj.postedBy = { username: 'Anonymous' };
        
        // Include the user ID in the response for vote status checking
        postObj.currentUserId = userId;
        
        res.status(200).json(postObj);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's posts
router.get('/my-posts', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { sort } = req.query;
        
        const posts = await Post.find({ postedBy: userId }).populate('postedBy', 'name');
        
        if (!posts) {
            return res.status(404).json({ message: 'No posts found' });
        }
        
        const postsWithFullImageUrls = posts.map(post => {
            const postObj = post.toObject();
            if (postObj.imageUrl && !postObj.imageUrl.startsWith('/')) {
                postObj.imageUrl = `/uploads/${postObj.imageUrl}`;
            }
            // Always set username to Anonymous for privacy
            postObj.postedBy = { username: 'Anonymous' };
            return postObj;
        });
        
        res.json(postsWithFullImageUrls);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: error.message || 'Error fetching posts' });
    }
});

// Update a post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, rating } = req.body;
        const userId = req.user.userId;
        
        // Find the post and check if user is the owner
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if the user is the owner of the post
        if (post.postedBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }
        
        // Update post fields
        post.title = title || post.title;
        post.content = content || post.content;
        post.category = category || post.category;
        
        // Only update rating if provided and post is a review
        if (rating && post.category === 'review') {
            post.rating = parseInt(rating);
        }
        
        // Update image if provided
        if (req.file) {
            post.imageUrl = req.file.filename;
        }
        
        // Save the updated post
        const updatedPost = await post.save();
        
        // Return the updated post with populated fields
        const populatedPost = await Post.findById(updatedPost._id).populate('postedBy', 'name');
        const postObj = populatedPost.toObject();
        
        // Format the response to match the GET endpoint format
        if (postObj.imageUrl && !postObj.imageUrl.startsWith('/')) {
            postObj.imageUrl = `/uploads/${postObj.imageUrl}`;
        }
        
        // Always set username to Anonymous for privacy
        postObj.postedBy = { username: 'Anonymous' };
        
        res.status(200).json(postObj);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(400).json({ message: error.message || 'Error updating post' });
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        // Find the post and check if user is the owner
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        // Check if the user is the owner of the post
        if (post.postedBy.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }
        
        // Delete the post
        await Post.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(400).json({ message: error.message || 'Error deleting post' });
    }
});

module.exports = router;