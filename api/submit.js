const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;

  if (!data.role || !data.university) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { error } = await supabase
    .from('responses')
    .insert({
      role: data.role,
      university: data.university,
      answers: data,
      submitted_at: data.submitted_at,
    });

  if (error) {
    console.error('Supabase insert error:', error.message, error.code);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
};
