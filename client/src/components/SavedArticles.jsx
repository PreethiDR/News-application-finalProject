import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, CircularProgress, Box, Snackbar, Alert } from '@mui/material';
import EverythingCard from './EverythingCard';

function SavedArticles() {
  const [savedArticles, setSavedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSavedArticles();
  }, []);

  const fetchSavedArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/saved-articles');
      const data = await response.json();

      console.log('Fetched saved articles:', data);

      if (data.success) {
        setSavedArticles(data.data);
      } else {
        setError(data.message || 'Failed to fetch saved articles');
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error);
      setError('Failed to fetch saved articles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/saved-articles/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        setSavedArticles(prev => prev.filter(article => article._id !== id));
        setSnackbar({
          open: true,
          message: 'Article deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete article',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        Saved Articles
      </Typography>

      {savedArticles.length === 0 ? (
        <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          No saved articles found. Try saving some articles from the home page!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {savedArticles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article._id}>
              <EverythingCard
                {...article}
                onDelete={() => handleDelete(article._id)}
                isSaved={true}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SavedArticles;
