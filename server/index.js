require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');

console.log('Starting server...');
console.log('Node environment:', process.env.NODE_ENV);
console.log('Checking API key:', process.env.NEWS_API_KEY ? 'Present' : 'Missing');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Article Schema
const articleSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  urlToImage: String,
  publishedAt: Date,
  source: {
    id: String,
    name: String
  },
  author: String,
  savedAt: {
    type: Date,
    default: Date.now
  }
});

const Article = mongoose.model('Article', articleSchema);

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'News Aggregator API is running',
    timestamp: new Date()
  });
});

// Helper function for API requests
async function makeApiRequest(url) {
  try {
    const response = await axios.get(url);
    return {
      status: 200,
      success: true,
      message: "Successfully fetched the data",
      data: response.data,
    };
  } catch (error) {
    console.error("API request error:", error.response ? error.response.data : error);
    return {
      status: 500,
      success: false,
      message: "Failed to fetch data from the API",
      error: error.response ? error.response.data : error.message,
    };
  }
}

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Test endpoint to add sample articles
app.get("/add-test-articles", async (req, res) => {
  try {
    const sampleArticles = [
      {
        title: "SpaceX Successfully Launches New Satellite",
        description: "SpaceX's Falcon 9 rocket successfully launched a new communications satellite into orbit on Thursday.",
        url: "https://example.com/spacex-launch",
        urlToImage: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7",
        publishedAt: new Date(),
        source: {
          name: "Space News",
          id: "space-news"
        },
        author: "John Smith",
        category: "technology"
      },
      {
        title: "New AI Breakthrough in Medical Research",
        description: "Scientists announce major breakthrough in using AI for early disease detection.",
        url: "https://example.com/ai-medical",
        urlToImage: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69",
        publishedAt: new Date(),
        source: {
          name: "Tech Daily",
          id: "tech-daily"
        },
        author: "Sarah Johnson",
        category: "science"
      },
      {
        title: "Global Climate Summit Reaches Historic Agreement",
        description: "World leaders agree on ambitious new climate targets at international summit.",
        url: "https://example.com/climate-summit",
        urlToImage: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51",
        publishedAt: new Date(),
        source: {
          name: "World News",
          id: "world-news"
        },
        author: "Michael Brown",
        category: "environment"
      }
    ];

    // Clear existing articles
    await Article.deleteMany({});
    
    // Insert sample articles
    const savedArticles = await Article.insertMany(sampleArticles);
    
    res.status(200).json({
      success: true,
      message: "Sample articles added successfully",
      articles: savedArticles
    });
  } catch (error) {
    console.error('Error adding sample articles:', error);
    res.status(500).json({
      success: false,
      message: "Error adding sample articles",
      error: error.message
    });
  }
});

// Save article endpoint
app.post("/api/save-article", async (req, res) => {
  try {
    console.log('Attempting to save article:', req.body);
    
    const { title, description, url, urlToImage, publishedAt, source, author } = req.body;
    
    // Check if article already exists
    const existingArticle = await Article.findOne({ url: url });
    if (existingArticle) {
      console.log('Article already exists:', existingArticle);
      return res.status(400).json({
        success: false,
        message: 'Article already saved'
      });
    }

    // Create new article
    const article = new Article({
      title,
      description,
      url,
      urlToImage,
      publishedAt,
      source,
      author,
      savedAt: new Date()
    });

    // Save to database
    const savedArticle = await article.save();
    console.log('Article saved successfully:', savedArticle);

    res.status(201).json({
      success: true,
      message: 'Article saved successfully',
      data: savedArticle
    });
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving article',
      error: error.message
    });
  }
});

// Get saved articles endpoint
app.get("/api/saved-articles", async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }

    console.log('Fetching saved articles from MongoDB...');
    const savedArticles = await Article.find({})
      .sort({ savedAt: -1 })
      .limit(100);

    console.log(`Found ${savedArticles.length} saved articles`);
    
    res.json({
      success: true,
      data: savedArticles
    });
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved articles',
      error: error.message
    });
  }
});

// Delete saved article endpoint
app.delete("/api/saved-articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete article:', id);

    const result = await Article.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log('Article deleted successfully:', result);
    res.json({
      success: true,
      message: 'Article deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: error.message
    });
  }
});

// Add test articles (for testing only)
app.post("/api/add-test-articles", async (req, res) => {
  try {
    const testArticles = [
      {
        title: "Test Article 1",
        description: "This is a test article 1",
        url: "https://example.com/1",
        urlToImage: "https://example.com/image1.jpg",
        publishedAt: new Date(),
        author: "Test Author 1",
        source: { name: "Test Source 1" },
        savedAt: new Date()
      },
      {
        title: "Test Article 2",
        description: "This is a test article 2",
        url: "https://example.com/2",
        urlToImage: "https://example.com/image2.jpg",
        publishedAt: new Date(),
        author: "Test Author 2",
        source: { name: "Test Source 2" },
        savedAt: new Date()
      }
    ];

    const saved = await Article.insertMany(testArticles);
    console.log('Added test articles:', saved);
    
    res.json({
      success: true,
      message: 'Test articles added successfully',
      data: saved
    });
  } catch (error) {
    console.error('Error adding test articles:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding test articles',
      error: error.message
    });
  }
});

// Delete all saved articles (for testing only)
app.delete("/api/delete-all-articles", async (req, res) => {
  try {
    const result = await Article.deleteMany({});
    console.log('Deleted all articles:', result);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} articles`,
      data: result
    });
  } catch (error) {
    console.error('Error deleting articles:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting articles',
      error: error.message
    });
  }
});

// All news endpoint
app.get("/api/all-news", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 12;
    const q = req.query.q || 'technology'; // default search query

    console.log('Fetching news with params:', { page, pageSize, q });
    
    // Use top-headlines instead of everything endpoint for more relevant news
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=technology&page=${page}&pageSize=${pageSize}&apiKey=${process.env.NEWS_API_KEY}`;
    console.log('Making request to:', url.replace(process.env.NEWS_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await axios.get(url);
    
    if (response.data.status === 'error') {
      console.error('News API error:', response.data);
      throw new Error(response.data.message || 'Error from News API');
    }

    // Log success
    console.log(`Successfully fetched ${response.data.articles?.length || 0} articles`);
    
    res.json({
      success: true,
      data: {
        articles: response.data.articles,
        totalResults: response.data.totalResults,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error.message);
    if (error.response?.data) {
      console.error('API Response:', error.response.data);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching news. Please try again later.',
      error: error.message
    });
  }
});

// Top headlines endpoint
app.get("/api/top-headlines", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 12;
    const category = req.query.category || 'general';
    
    console.log('Fetching top headlines:', { category, page, pageSize });
    
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.NEWS_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'Error from News API');
    }
    
    res.json({
      success: true,
      data: {
        articles: response.data.articles,
        totalResults: response.data.totalResults,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top headlines',
      error: error.message
    });
  }
});

// Country news endpoint
app.get("/api/country/:iso", async (req, res) => {
  try {
    const { iso } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 12;
    
    console.log('Fetching country news:', { iso, page, pageSize });
    
    const url = `https://newsapi.org/v2/top-headlines?country=${iso}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.NEWS_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data.status === 'error') {
      throw new Error(response.data.message || 'Error from News API');
    }
    
    res.json({
      success: true,
      data: {
        articles: response.data.articles,
        totalResults: response.data.totalResults,
        currentPage: page
      }
    });
  } catch (error) {
    console.error('Error fetching country news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching country news',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
