const { sql } = require('@vercel/postgres');

module.exports = async function handler(request, response) {
  try {
    await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE;`;
    return response.status(200).json({ message: 'Migration successful: added confirmed column' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
