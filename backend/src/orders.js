import { createOrder, updateOrderStatus, getOrderById } from './db.js';

/**
 * Envia pedido para API de fulfillment
 */
export async function sendToFulfillment(orderId, payload, fulfillmentUrl) {
  try {
    const response = await fetch(fulfillmentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        ...payload
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Fulfillment API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error(`[FULFILLMENT] Error sending order ${orderId}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Processa webhook de pedido: cria no DB e envia para fulfillment
 */
export async function processOrder(orderId, payload, fulfillmentUrl) {
  try {
    // Cria pedido com status 'received'
    createOrder(orderId, payload, 'received');
    console.log(`[ORDER] Created order ${orderId} with status 'received'`);

    // Envia para fulfillment
    const result = await sendToFulfillment(orderId, payload, fulfillmentUrl);

    if (result.success) {
      updateOrderStatus(orderId, 'sent', null, true);
      console.log(`[ORDER] Order ${orderId} sent to fulfillment successfully`);
      return { success: true, status: 'sent' };
    } else {
      updateOrderStatus(orderId, 'failed', result.error, true);
      console.error(`[ORDER] Order ${orderId} failed to send to fulfillment`);
      return { success: false, status: 'failed', error: result.error };
    }
  } catch (error) {
    console.error(`[ORDER] Error processing order ${orderId}:`, error.message);
    updateOrderStatus(orderId, 'failed', error.message, true);
    return { success: false, status: 'failed', error: error.message };
  }
}

/**
 * Retenta enviar pedido para fulfillment
 */
export async function retryOrder(orderId, fulfillmentUrl) {
  const order = getOrderById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'failed') {
    throw new Error('Only failed orders can be retried');
  }

  console.log(`[ORDER] Retrying order ${orderId} (attempt ${order.attempts + 1})`);

  // Envia novamente para fulfillment
  const result = await sendToFulfillment(orderId, order.payload, fulfillmentUrl);

  if (result.success) {
    updateOrderStatus(orderId, 'sent', null, true);
    console.log(`[ORDER] Order ${orderId} retry successful`);
    return { success: true, status: 'sent' };
  } else {
    updateOrderStatus(orderId, 'failed', result.error, true);
    console.error(`[ORDER] Order ${orderId} retry failed`);
    return { success: false, status: 'failed', error: result.error };
  }
}

