# News Application

A modern, full-stack news aggregator application built with React, Node.js, Express, and MongoDB. This application allows users to browse news from various sources, save articles for later reading, and filter news by country and categories.

## Features

- **Browse Latest News**: Access the most recent news articles from various sources
- **Save Articles**: Save interesting articles to read later
- **Category Filtering**: Filter news by different categories
- **Country-specific News**: View news from different countries
- **Top Headlines**: Access trending news headlines
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- Material-UI (MUI)
- Vite
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests
- Morgan for request logging

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- News API Key (from newsapi.org)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PreethiDR/News-application-finalProject.git
cd News-application-finalProject
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEWS_API_KEY=your_news_api_key
```

4. Install client dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the server:
```bash
cd server
npm start
```

2. Start the client:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## API Endpoints

### News Endpoints
- `GET /api/all-news`: Get latest news articles
- `GET /api/top-headlines`: Get top headlines
- `GET /api/country/:iso`: Get country-specific news

### Saved Articles Endpoints
- `GET /api/saved-articles`: Get all saved articles
- `POST /api/save-article`: Save a new article
- `DELETE /api/saved-articles/:id`: Delete a saved article

## Features in Detail

### Home Page
- Latest news articles in a responsive grid layout
- Save article functionality
- Load more articles option
- Article preview with image, title, description, and source

### Saved Articles
- View all saved articles
- Delete saved articles
- Persistent storage using MongoDB

### Navigation
- Easy navigation between different sections
- Responsive header with mobile menu
- Quick access to different news categories

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- News data provided by [NewsAPI](https://newsapi.org/)
- UI components from [Material-UI](https://mui.com/)
- Icons from Material Icons
