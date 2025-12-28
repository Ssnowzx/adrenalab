
// Função Serverless para o Vercel - Criar Preferência do Mercado Pago
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { items } = req.body;
  const ACCESS_TOKEN = 'APP_USR-5071834581097038-122812-7e83297dfd4b14bda6b8d2d2f245577f-3098493520';

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items,
        back_urls: {
          success: `${req.headers.origin}/?payment=success`,
          failure: `${req.headers.origin}/?payment=failure`,
          pending: `${req.headers.origin}/?payment=pending`,
        },
        auto_return: 'approved',
      }),
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro MP:', error);
    return res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
}
