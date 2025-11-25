const express = require('express');
const cors = require('cors');
const { search } = require('duck-duck-scrape');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// होमपेज चेक
app.get('/', (req, res) => {
  res.send('✅ Search Server is Live! (Images + Videos)');
});

// API: Images और Videos दोनों के लिए
app.get('/api/search', async (req, res) => {
  const { q, type } = req.query; // type can be 'image' or 'video'

  if (!q) {
    return res.status(400).json({ error: 'Query "q" is required' });
  }

  try {
    const searchType = type === 'video' ? 'videos' : 'image';
    
    // DuckDuckGo से सर्च करें
    const searchResults = await search(q, {
      searchType: searchType,
      safeSearch: 0 // 0=Off, 1=Moderate
    });

    // डेटा को सही फॉर्मेट में बदलें
    const formatted = searchResults.results.map(item => {
      if (type === 'video') {
        return {
          title: item.title || 'Video Result',
          thumbnail: item.images ? item.images.medium : item.image, // वीडियो का थंबनेल
          url: item.content || item.url, // वीडियो का लिंक
          duration: item.duration || '',
          isVideo: true
        };
      } else {
        return {
          title: item.title || 'Image Result',
          image: item.image,
          thumbnail: item.thumbnail,
          url: item.url,
          source: item.source,
          isVideo: false
        };
      }
    });

    res.json({
      results: formatted,
      type: type || 'image',
      total: formatted.length
    });

  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
