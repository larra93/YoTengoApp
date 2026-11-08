import { z } from 'zod';

export const needFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'El título debe tener al menos 3 caracteres.')
      .max(120, 'El título no puede superar los 120 caracteres.'),
    description: z
      .string()
      .trim()
      .min(10, 'Describe tu pedido con un poco más de detalle.')
      .max(2000, 'La descripción no puede superar los 2000 caracteres.'),
    categoryId: z.number().int('Selecciona una categoría.').positive('Selecciona una categoría.'),
    dealType: z.enum(['rent', 'loan', 'swap']),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD.'),
    endDate: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || /^\d{4}-\d{2}-\d{2}$/.test(value),
        'Usa el formato AAAA-MM-DD.',
      ),
    budget: z.string().trim().max(120, 'Máximo 120 caracteres.'),
    addressLabel: z.string().trim().max(120, 'Máximo 120 caracteres.'),
  })
  .refine((values) => !values.endDate || values.endDate >= values.startDate, {
    path: ['endDate'],
    message: 'La fecha de término debe ser igual o posterior al inicio.',
  });

export type NeedFormValues = z.infer<typeof needFormSchema>;
