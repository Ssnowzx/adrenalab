
// Função Serverless para o Vercel - Criar Preferência do Mercado Pago
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Configuração segura do Token
  const ACCESSTOKEN = process.env.MP_ACCESS_TOKEN;
  if (!ACCESSTOKEN) {
    console.error('ERRO CRÍTICO: MP_ACCESS_TOKEN não configurada.');
    return res.status(500).json({ error: 'Erro de configuração do servidor' });
  }

  try {
    const { items } = req.body;

    // Validação de Segurança do Input
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio ou formato inválido' });
    }

    // Sanitização básica dos itens (Garantir que têm preço e título)
    const validItems = items.map(item => ({
      title: String(item.title).substring(0, 255), // Limitar tamanho
      quantity: Math.max(1, parseInt(item.quantity) || 1), // Mínimo 1
      unit_price: parseFloat(item.unit_price) || 0,
      currency_id: 'BRL'
    })).filter(item => item.unit_price > 0);

    if (validItems.length === 0) {
      return res.status(400).json({ error: 'Nenhum item válido para processar' });
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESSTOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: validItems,
        back_urls: {
          success: `${req.headers.origin}/?payment=success`,
          failure: `${req.headers.origin}/?payment=failure`,
          pending: `${req.headers.origin}/?payment=pending`,
        },
        auto_return: 'approved',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro MP API:', errorData);
      throw new Error('Falha na comunicação com Mercado Pago');
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Erro MP:', error);
    return res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
}
