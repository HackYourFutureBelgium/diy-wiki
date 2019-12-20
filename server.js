const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const fs = require('fs').promises;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});
// app.use(express.static(filePath));
// Uncomment this out once you've made your first route.
app.use(express.static(path.join(__dirname, 'client', 'build')));
// some helper functions you can use
async function readFile(filePath) {
  return await fs.readFile(filePath, 'utf-8');
}
async function writeFile(filePath, data) {
  return await fs.writeFile(filePath, data, 'utf-8');
}
async function readDir(dirPath) {
  return await fs.readdir(dirPath);
}
pages = ['home', 'about'];
// some more helper functions
const DATA_DIR = 'data';
const TAG_RE = /#\w+/g;
function slugToPath(slug) {
  const filename = `${slug}.md`;
  return path.join(DATA_DIR, filename);
}
function jsonOK(res, data) {
  res.json({ status: 'ok', ...data });
}
function jsonError(res, message) {
  res.json({ status: 'error', message });
}

app.get('/api/page/:slug', async (req, res) => {
  const filename = `${req.params.slug}`;
  // const filename = req.params.slug + '.md';
  const fullFilename = path.join(DATA_DIR, filename);
  // const fullFilename = slugToPath(req.params.slug);
  try {
    const text = await readFile(fullFilename);
    // res.json({ slug: req.params.slug, fullFilename, text });
    res.json({ status: 'ok', body: text });
  } catch {
    res.json({ status: 'error', message: 'Page does not exist.' });
  }
});

app.post('/api/page/:slug', async (req, res) => {
  const pages = {
    page: req.body.page,
    text: req.body.text
  };
  pages.page = req.params.slug;
  pages.text = req.body.body;
  const filename = `${pages.page}`;
  const fullFilename = path.join(DATA_DIR, filename);
  const text = await writeFile(fullFilename, pages.text);
  jsonOK(res, text);
});

app.get('/api/pages/all', async (req, res) => {
  const page = await readDir(DATA_DIR);
  res.json({ status: 'ok', pages: page });
});

// GET: '/api/tags/alla'
// success response: {status:'ok', tags: ['tagName', 'otherTagName']}
//  tags are any word in all documents with a # in front of it
// failure response: no failure response
app.get('/api/tags/all', async(req, res) => {
  const page = await readDir(DATA_DIR);
  res.json({ status: 'ok', tags: page });
});
// GET: '/api/tags/:tag'
// success response: {status:'ok', tag: 'tagName', pages: ['tagName', 'otherTagName']}
//  file names do not have .md, just the name!
// failure response: no failure response
// If you want to see the wiki client, run npm install && npm build in the client folder,
// then comment the line above and uncomment out the lines below and comment the line above.
app.get('/api/tags/:tag',async (req, res) => {
  const page = await readDir(DATA_DIR);
  res.json({ status: 'ok', tag: 'tagName', pages: page });
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Wiki app is serving at http://localhost:${port}`));
