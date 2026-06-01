export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  const SUPABASE_SERVICE_KEY = SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const data = req.body;

  if (!data.role || !data.university) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      role: data.role,
      university: data.university,
      answers: data,
      submitted_at: data.submitted_at,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Supabase error:', err);
    return res.status(500).json({ error: 'Failed to save response' });
  }

  return res.status(200).json({ success: true });
}
