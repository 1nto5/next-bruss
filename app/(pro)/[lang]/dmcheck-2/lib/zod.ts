import { z } from 'zod';

export const loginSchema = z.object({
  identifier1: z.string().min(1, 'Nr personalny 1 jest wymagany'),
  identifier2: z.string().optional(),
  identifier3: z.string().optional(),
});

export type LoginType = z.infer<typeof loginSchema>;

export const dmcScanSchema = z.object({
  dmc: z.string().min(1, 'DMC jest wymagany'),
  articleConfigId: z.string().length(24, 'Nieprawidłowe ID artykułu'),
  operatorPersonalNumber: z.string().min(1, 'Operator jest wymagany'),
});

export type DmcScanType = z.infer<typeof dmcScanSchema>;

export const hydraScanSchema = z.object({
  hydra: z.string().min(1, 'Kod QR jest wymagany'),
  articleConfigId: z.string().length(24, 'Nieprawidłowe ID artykułu'),
  operatorPersonalNumber: z.string().min(1, 'Operator jest wymagany'),
});

export type HydraScanType = z.infer<typeof hydraScanSchema>;

export const palletScanSchema = z.object({
  pallet: z.string().min(34, 'Kod QR palety jest wymagany'),
  articleConfigId: z.string().length(24, 'Nieprawidłowe ID artykułu'),
  operatorPersonalNumber: z.string().min(1, 'Operator jest wymagany'),
});

export type PalletScanType = z.infer<typeof palletScanSchema>;