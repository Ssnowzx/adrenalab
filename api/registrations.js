const { sql } = require('@vercel/postgres');

module.exports = async function handler(request, response) {
  try {
    const { rows } = await sql`SELECT * FROM registrations ORDER BY date DESC;`;
    return response.status(200).json(rows);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
