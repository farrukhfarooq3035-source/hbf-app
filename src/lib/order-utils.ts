/** Format order id as short order number: #HBF-XXXXXX */
export function formatOrderNumber(orderId: string): string {
  const short = orderId.replace(/-/g, '').slice(-6).toUpperCase();
  return `#HBF-${short}`;
}
