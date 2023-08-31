const { Pool } = require('pg');
const shortid = require('shortid');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mydatabase',
  password: 'BladeNo#2',
  port: 5432,
});

exports.generateLink = async function (req, res) {
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
    res.json({ hash, name, url});
  } catch (error) {
	  console.error("Database error:", error);
    res.status(500).json({ error: 'Database error' });
  }
}

exports.redirectLink = async function(req, res) {
  const { hash } = req.params;

  try {
    const result = await pool.query('SELECT name, url FROM links WHERE hash = $1 LIMIT 1', [hash]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Link not found');
    }

    const { name, url } = result.rows[0];
    res.redirect(`/relink?name=${encodeURIComponent(name)}&url=${encodeURIComponent(url)}`);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send('Internal Server Error');
  }
}

exports.index = async function(req, res) {
	try {
    const result = await pool.query('SELECT * FROM links ORDER BY id DESC LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).send('No links found');
    }

    const { hash } = result.rows[0];

    res.status(301).redirect(`https://coturntest.mooo.com/${encodeURIComponent(hash)}`);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send('Internal Server Error');
  }
}

function generateUniqueHash() {
    return shortid.generate();
}

