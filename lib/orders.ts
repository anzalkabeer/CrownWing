import { getDb } from './mongodb';

export interface OrderItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  razorpayOrderId?: string;
  paymentDetails?: any;
  createdAt: string;
}

/**
 * Create a new order in MongoDB.
 */
export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const db = await getDb();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await db.collection('orders').insertOne(newOrder);
  return newOrder;
}

/**
 * Fetch past orders for a specific user with pagination.
 */
export async function getUserOrders(userId: string, limit: number = 20, skip: number = 0): Promise<Order[]> {
  const db = await getDb();
  
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const safeSkip = Math.max(0, skip);

  const orders = await db.collection('orders')
    .find({ userId })
    .sort({ createdAt: -1 })
    .skip(safeSkip)
    .limit(safeLimit)
    .toArray();

  return orders.map(o => ({
    id: o.id,
    userId: o.userId,
    items: o.items,
    totalAmount: o.totalAmount,
    status: o.status,
    razorpayOrderId: o.razorpayOrderId,
    createdAt: o.createdAt,
  }));
}
