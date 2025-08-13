const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['question', 'confession', 'general', 'meme', 'review']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: function() {
            return this.category === 'review';
        }
    },
    imageUrl: {
        type: String
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);