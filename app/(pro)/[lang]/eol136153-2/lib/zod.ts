import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Required'),
});

export const hydraScanSchema = z.object({
  hydraQr: z.string().min(34, 'Invalid QR code'),
  operator: z.string().min(1, 'Operator required'),
});

export const palletScanSchema = z.object({
  palletQr: z.string().min(1, 'Pallet QR required'),
  workplace: z.string().min(1, 'Workplace required'),
  article: z.string().min(1, 'Article required'),
  operator: z.string().min(1, 'Operator required'),
});

export type LoginType = z.infer<typeof loginSchema>;
export type HydraScanType = z.infer<typeof hydraScanSchema>;
export type PalletScanType = z.infer<typeof palletScanSchema>;