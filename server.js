const express = require('express');
const cors = require('cors');
const gis = require('g-i-s');      // Google Images के लिए
const yts = require('yt-search');  // YouTube Videos के लिए

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Google Image Search को Promise में बदलने के लिए फंक्शन
function googleImage(term) {
  return new Promise((resolve, reject) => {
    gis(term, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
}

app.get('/', (req, res) => {
  res.send('✅ Server is Live! (Google Images + YouTube)');
});

app.get('/api/search', async (req, res) => {
  const { q, type } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    let formattedResults = [];

    if (type === 'video') {
      // --- YouTube Search Logic ---
      const videoResult = await yts(q);
      const videos = videoResult.videos.slice(0, 30); // टॉप 30 वीडियो

      formattedResults = videos.map(item => ({
        title: item.title,
        thumbnail: item.thumbnail,
        url: item.url,
        duration: item.timestamp,
        views: item.views,
        source: 'YouTube',
        isVideo: true
      }));

    } else {
      // --- Google Image Logic ---
      const images = await googleImage(q);
      
      // टॉप 80 इमेजेस निकालें
      formattedResults = images.slice(0, 80).map(item => ({
        title: 'Google Image',
        image: item.url,
        thumbnail: item.url, // Google GIS कभी-कभी थंबनेल अलग नहीं देता
        url: item.url,
        source: 'Google',
        isVideo: false
      }));
    }

    res.json({
      results: formattedResults,
      total: formattedResults.length,
      source: type === 'video' ? 'YouTube' : 'Google Images'
    });

  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Search Failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
