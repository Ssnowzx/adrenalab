const { sql } = require('@vercel/postgres');

module.exports = async function handler(request, response) {
  try {
    const { rows } = await sql`SELECT * FROM registrations WHERE confirmed = TRUE ORDER BY date ASC;`;

    const categories = {
      'Solo': [],
      'Mini': [],
      'Solo + Mini': []
    };

    rows.forEach(reg => {
      if (categories[reg.categoria]) {
        categories[reg.categoria].push(reg.nome);
      }
    });

    let txtContent = '';

    txtContent += '=== SOLO ===\n';
    categories['Solo'].forEach(name => txtContent += `${name}\n`);
    txtContent += '\n';

    txtContent += '=== MINI ===\n';
    categories['Mini'].forEach(name => txtContent += `${name}\n`);
    txtContent += '\n';

    txtContent += '=== SOLO + MINI ===\n';
    categories['Solo + Mini'].forEach(name => txtContent += `${name}\n`);
    txtContent += '\n';

    response.setHeader('Content-Type', 'text/plain');
    response.setHeader('Content-Disposition', 'attachment; filename="inscricoes.txt"');
    return response.status(200).send(txtContent);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
