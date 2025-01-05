import { React, useState, useEffect } from 'react';
import EverythingCard from './EverythingCard';
import { Container, Grid, Typography, Button, Box, CircularProgress } from '@mui/material';

function AllNews() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageSize = 12;

  useEffect(() => {
    fetchNews();
  }, [page]);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/all-news?page=${page}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const json = await response.json();
      console.log('Fetched news:', json);

      if (json.success) {
        setData(prevData => [...prevData, ...json.data.articles]);
        setTotalResults(json.data.totalResults);
      } else {
        setError(json.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Latest News
      </Typography>
      
      <Grid container spacing={3}>
        {data.map((article, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${article.url}-${index}`}>
            <EverythingCard {...article} />
          </Grid>
        ))}
      </Grid>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && data.length < totalResults && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            Load More
          </Button>
        </Box>
      )}

      {!isLoading && data.length === 0 && !error && (
        <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          No articles found. Please try again later.
        </Typography>
      )}
    </Container>
  );
}

export default AllNews;
