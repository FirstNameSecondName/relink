const { Pool } = require('pg');
const shortid = require('shortid');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydatabase',
  password: 'BladeNo#2',
  port: 5432,
});

async function generateLinkHandler(req, res) {
  console.log("generateLinkHandler called with req.body:", req.body); 
  const { name, url } = req.body;
  
  if (!name || !url) {
	  console.error("Error: Name and URL are missing"); 
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  const hash = generateUniqueHash();
  console.log(`Generated hash for name=${name}, url=${url}:`, hash);

  try {
    await pool.query('INSERT INTO links (name, url, hash) VALUES ($1, $2, $3)', [name, url, hash]);
	console.log("Insertion to database successful");
    res.json({ hash });
  } catch (error) {
	  console.error("Database error:", error);
    res.status(500).json({ error: 'Database error' });
  }
}

function generateUniqueHash() {
    return shortid.generate();
}

module.exports = {
  generateLinkHandler,
};
