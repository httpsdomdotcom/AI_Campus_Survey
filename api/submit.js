const { Client } = require('pg');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  if (!data.role || !data.university) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = new Client({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    await client.query(
      'INSERT INTO responses (role, university, answers, submitted_at) VALUES ($1, $2, $3, $4)',
      [data.role, data.university, JSON.stringify(data), data.submitted_at]
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('DB error:', err.message);
    return res.status(500).json({ error: 'Failed to save response' });
  } finally {
    await client.end();
  }
};
