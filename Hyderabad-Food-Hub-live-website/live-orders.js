// Public Supabase values are safe in a browser app. Never add a secret/service-role key here.
const HFH_SUPABASE_URL = 'https://fvfprhcseahjkxsdawcb.supabase.co';
const HFH_SUPABASE_KEY = 'sb_publishable_IXWTkQoDHUxWoUukQJ4TCQ_PcRiiCCF';
const branchNames = { 1: 'Secunderabad', 7: 'Masab Tank', 8: 'Jubilee Hills' };

async function hfhRequest(path, options = {}) {
  const response = await fetch(`${HFH_SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: HFH_SUPABASE_KEY,
      Authorization: `Bearer ${HFH_SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error(await response.text());
  return response.status === 204 ? null : response.json();
}

window.saveLiveOrder = async function saveLiveOrder(order) {
  if (!order.items.length) return;
  const restaurantId = Number(order.items[0].key.split(':')[0]);
  const branchName = branchNames[restaurantId];
  if (!branchName) return;
  const branches = await hfhRequest(`branches?select=id&name=eq.${encodeURIComponent(branchName)}&limit=1`);
  if (!branches.length) throw new Error('Restaurant branch not found');
  const savedOrders = await hfhRequest('orders', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      branch_id: branches[0].id,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      fulfilment: order.fulfilment,
      delivery_partner: order.deliveryPartner,
      payment_method: order.payment,
      total_inr: order.total
    })
  });
  await hfhRequest('order_items', {
    method: 'POST',
    body: JSON.stringify(order.items.map(item => ({
      order_id: savedOrders[0].id,
      item_name: item.name,
      unit_price_inr: item.price,
      quantity: item.qty
    })))
  });
};
