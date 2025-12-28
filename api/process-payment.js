
import { createClient } from '@supabase/supabase-js';

// Função Serverless para Processar Pagamento e Criar Pedido com Segurança
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // 1. Extrair dados da requisição
  const { formData, items, userId } = req.body;

  // 2. Configurações de Ambiente (SEGURANÇA EXTREMA AQUI)
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gdaqzqnaluuarmeoqziz.supabase.co';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!MP_ACCESS_TOKEN || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('ERRO CRÍTICO: Variáveis de ambiente faltando.');
    return res.status(500).json({ error: 'Erro de configuração no servidor. Avise o admin.' });
  }

  // 3. Inicializar Supabase Admin (Bypassa RLS para escrever o pedido)
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 4. Processar Pagamento no Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pay-${Date.now()}`
      },
      body: JSON.stringify(formData),
    });

    const paymentResult = await mpResponse.json();

    // Se falhar o pagamento, retorna erro e NÃO cria pedido
    if (paymentResult.status !== 'approved' && paymentResult.status !== 'in_process') {
      return res.status(200).json({
        status: paymentResult.status || 'rejected',
        status_detail: paymentResult.status_detail,
        error: 'Pagamento não aprovado'
      });
    }

    // 5. Pagamento Aprovado/Processando -> CRIAR PEDIDO NO BANCO (LADO SERVIDOR)
    // Isso garante que ninguém cria pedido fake via console do navegador
    if (userId && items && items.length > 0) {

      // Calcular total no servidor para garantir que bate com o pago (Opcional mas recomendado)
      // Aqui usaremos o total_paid_amount do MP para ser a verdade absoluta
      const totalAmount = paymentResult.transaction_amount;

      // A. Inserir na tabela 'orders'
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: paymentResult.status,
          payment_id: paymentResult.id.toString(),
          payment_method: paymentResult.payment_method_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('Erro ao salvar pedido no DB:', orderError);
        // Pagamento foi processado mas falhou ao salvar pedido.
        // Ideal seria ter um log de erro crítico ou estornar. 
        // Retornaremos sucesso do pagamento mas com aviso.
      } else {
        console.log('Pedido salvo com sucesso! ID:', order.id);

        // B. Inserir Itens
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_title: item.title,
          product_price: item.price,
          quantity: 1
        }));

        await supabaseAdmin.from('order_items').insert(orderItems);
      }
    }

    // 6. Retorno final para o Frontend
    return res.status(200).json({
      id: paymentResult.id,
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      point_of_interaction: paymentResult.point_of_interaction
    });

  } catch (error) {
    console.error('Erro no Processamento Geral:', error);
    return res.status(500).json({ error: 'Erro interno ao processar transação.' });
  }
}
