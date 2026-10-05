/**
 * Simulated checkout. In production, create the transaction on our backend with the payment
 * provider (e.g. Wompi or Mercado Pago), and unlock the level only after the server confirms the
 * payment through the provider's webhook.
 */
import { LevelId } from '@/data/levels';

export type PaymentMethod = 'tarjeta' | 'pse' | 'nequi';

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: 'tarjeta', label: 'Tarjeta débito o crédito', hint: 'Visa, Mastercard, Amex' },
  { id: 'pse', label: 'PSE', hint: 'Débito desde tu banco' },
  { id: 'nequi', label: 'Nequi', hint: 'Pago desde tu celular' },
];

export async function checkout(levelId: LevelId, method: PaymentMethod) {
  await new Promise((r) => setTimeout(r, 1400));
  return { ok: true as const, reference: `VF-${levelId}-${method.toUpperCase()}-${Date.now().toString(36)}` };
}
