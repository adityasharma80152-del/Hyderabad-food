(() => {
  const $ = s => document.querySelector(s);
  $('#signIn').onclick = () => $('#authDialog').showModal();
  $('#closeAuth').onclick = () => $('#authDialog').close();
  $('#authForm').onsubmit = e => { e.preventDefault(); localStorage.setItem('hfh-user', 'Customer'); $('#authDialog').close(); $('#signIn').textContent = 'My account'; };
  if (localStorage.getItem('hfh-user')) $('#signIn').textContent = 'My account';
  const original = $('#orderForm').onsubmit;
  $('#orderForm').onsubmit = async e => {
    e.preventDefault();
    const values = new FormData(e.target);
    const items = window.cart || [];
    const order = { id: `HFH-${Math.floor(1000 + Math.random() * 9000)}`, createdAt: new Date().toLocaleString(), status: 'New', customerName: values.get('customerName') || 'Website customer', customerPhone: values.get('customerPhone') || 'Not provided', fulfilment: values.get('fulfilment'), deliveryPartner: values.get('fulfilment') === 'Delivery' ? values.get('deliveryPartner') : 'Pickup', payment: values.get('payment'), items, total: items.reduce((n, i) => n + i.price * i.qty, 0) };
    const orders = JSON.parse(localStorage.getItem('hfh-orders') || '[]');
    orders.unshift(order); localStorage.setItem('hfh-orders', JSON.stringify(orders));
    try { await window.saveLiveOrder(order); } catch (error) { console.error('Live order save failed', error); }
    original(e);
  };
})();
