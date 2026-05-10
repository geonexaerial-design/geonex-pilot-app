export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('MP Token exists:', !!process.env.MP_ACCESS_TOKEN);
  console.log('Request type:', req.body.type);

  const { type, payer_email } = req.body;
  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

  const plans = {
    mensual: {
      reason: 'Geonex Aerial Pro Mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 250,
        currency_id: 'MXN'
      },
      back_url: 'https://geonexaerial.com/?mp_status=success',
      payer_email: payer_email || 'test_user@test.com',
    },
    anual: {
      reason: 'Geonex Aerial Pro Anual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 3000,
        currency_id: 'MXN'
      },
      back_url: 'https://geonexaerial.com/?mp_status=success',
      payer_email: payer_email || 'test_user@test.com',
    }
  };

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plans[type])
    });

    const responseText = await response.text();
    console.log('MP Response status:', response.status);
    console.log('MP Response body:', responseText);

    const data = JSON.parse(responseText);

    if (data.init_point) {
      return res.status(200).json({ init_point: data.init_point });
    } else {
      return res.status(400).json({ error: responseText, status: response.status });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
