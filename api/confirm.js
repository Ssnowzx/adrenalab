const { sql } = require('@vercel/postgres');

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = request.body;

  if (!id) {
    return response.status(400).json({ error: 'ID is required' });
  }

  try {
    await sql`UPDATE registrations SET confirmed = TRUE WHERE id = ${id};`;
    return response.status(200).json({ success: true });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
