const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  url: {
    type: String,
    required: true,
    unique: true
  },
  urlToImage: String,
  publishedAt: {
    type: Date,
    required: true
  },
  source: {
    name: {
      type: String,
      required: true
    },
    id: String
  },
  author: String,
  content: String,
  category: String,
  savedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Article', articleSchema);
