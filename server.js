const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const port = process.env.PORT || 3000;

// Enable history API fallback for SPA routing
app.use(history());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  index: 'index.html'
}));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
