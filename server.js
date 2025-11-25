const express = require('express');
const cors = require('cors');
const google = require('google-this'); // Google Library

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Google Search Server is Live!');
});

app.get('/api/search', async (req, res) => {
  const { q, type } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    let formattedResults = [];

    if (type === 'video') {
      // Google Video Search
      const response = await google.search(q, {
        page: 0,
        safe: false,
        additional_params: { tbm: 'vid' } // 'vid' means Video Tab
      });

      // Data formatting
      formattedResults = response.results.map(item => ({
        title: item.title,
        // Google video thumbnail kabhi kabhi nahi deta, isliye fallback
        thumbnail: item.favicons?.high_res || 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', 
        url: item.url,
        isVideo: true
      }));

    } else {
      // Google Image Search
      const images = await google.image(q, { safe: false });

      // Data formatting
      formattedResults = images.map(item => ({
        title: item.origin.title || 'Google Image',
        image: item.url,       // Full Image
        thumbnail: item.preview.url, // Small Image
        url: item.origin.website.url,
        source: 'Google',
        isVideo: false
      }));
    }

    res.json({
      results: formattedResults,
      total: formattedResults.length
    });

  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Search Failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
