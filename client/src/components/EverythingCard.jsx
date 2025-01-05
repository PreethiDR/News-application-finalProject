import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  IconButton,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';

function EverythingCard({
  title,
  description,
  url,
  urlToImage,
  publishedAt,
  source,
  author,
  _id,
  onDelete,
  isSaved = false
}) {
  const [saved, setSaved] = useState(isSaved);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          url,
          urlToImage,
          publishedAt,
          source,
          author
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSaved(true);
        setSnackbar({
          open: true,
          message: 'Article saved successfully!',
          severity: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to save article');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      setSnackbar({
        open: true,
        message: error.message === 'Article already saved' ? 'Article already saved!' : 'Failed to save article',
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(_id);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {urlToImage && (
        <CardMedia
          component="img"
          height="200"
          image={urlToImage}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Source: {source?.name || 'Unknown'}
        </Typography>
        
        {author && (
          <Typography variant="caption" display="block">
            Author: {author}
          </Typography>
        )}
        
        <Typography variant="caption" display="block">
          Published: {new Date(publishedAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          size="small"
          color="primary"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read More
        </Button>

        {isSaved ? (
          <IconButton onClick={handleDelete} color="error" title="Delete article">
            <DeleteIcon />
          </IconButton>
        ) : (
          <IconButton 
            onClick={handleSave} 
            color="primary"
            title={saved ? 'Article saved' : 'Save article'}
          >
            {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        )}
      </CardActions>

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
    </Card>
  );
}

export default EverythingCard;
