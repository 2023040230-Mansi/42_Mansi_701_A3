const express = require('express');
const path = require('path');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.static(path.join(__dirname, 'public')));

const getJson = (url) => new Promise((resolve, reject) => {
  request({ url, json: true }, (err, response, body) => {
    if (err) return reject(err);
    if (response && response.statusCode >= 400) {
      return reject(new Error(`Request failed with status ${response.statusCode}`));
    }
    resolve(body);
  });
});

// Aggregates free API responses for a given name
app.get('/api/aggregate', async (req, res) => {
  const name = (req.query.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name query param required' });

  try {
    const agifyUrl = `https://api.agify.io?name=${encodeURIComponent(name)}`;
    const genderizeUrl = `https://api.genderize.io?name=${encodeURIComponent(name)}`;
    const nationalizeUrl = `https://api.nationalize.io?name=${encodeURIComponent(name)}`;

    const [age, gender, nationality] = await Promise.all([
      getJson(agifyUrl),
      getJson(genderizeUrl),
      getJson(nationalizeUrl)
    ]);

    res.json({ name, age, gender, nationality });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to call external APIs' });
  }
});

app.listen(PORT, () => console.log(`Part6 utility app listening on http://localhost:${PORT}`));
