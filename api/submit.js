const { Client } = require('pg');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  if (!data.role || !data.university) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const url = new URL(process.env.POSTGRES_URL_NON_POOLING);

  const client = new Client({
    host: url.hostname,
    port: Number(url.port) || 5432,
    database: url.pathname.replace(/^\//, ''),
    user: url.username,
    password: url.password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const dbInfo = await client.query(`SELECT current_database(), current_schema(), current_user`);
    console.log('DB info:', JSON.stringify(dbInfo.rows[0]));

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.responses (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        role text,
        university text,
        answers jsonb,
        submitted_at timestamptz
      )
    `);

    const insert = await client.query(
      'INSERT INTO public.responses (role, university, answers, submitted_at) VALUES ($1, $2, $3, $4) RETURNING id',
      [data.role, data.university, JSON.stringify(data), data.submitted_at]
    );
    console.log('Inserted row id:', insert.rows[0]?.id);

    const count = await client.query('SELECT COUNT(*) FROM public.responses');
    console.log('Total rows in public.responses:', count.rows[0].count);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('DB error:', err.message);
    return res.status(500).json({ error: 'Failed to save response' });
  } finally {
    await client.end();
  }
};
