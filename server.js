const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Route to scrape article title
app.post('/fetch-title', async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const articleTitle = $('title').text().trim();

    if (articleTitle) {
      res.json({ success: true, title: articleTitle });
    } else {
      res.status(400).json({ success: false, message: 'Title not found' });
    }
  } catch (error) {
    console.error('Error fetching article title:', error);
    res.status(500).json({ success: false, message: 'Error fetching article title' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});