import { z } from 'zod';

export const offerSchema = z
  .object({
    price: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || /^\d+$/.test(value), 'Ingresa solo números para el precio'),
    swapOfferedDetails: z
      .string()
      .trim()
      .max(180, 'El objeto/servicio ofrecido es demasiado largo')
      .optional(),
    conditions: z.string().trim().max(500, 'Las condiciones son demasiado largas').optional(),
  })
  .refine((value) => Boolean(value.price) || Boolean(value.swapOfferedDetails?.trim()), {
    message: 'Indica un precio o describe lo que ofreces',
    path: ['swapOfferedDetails'],
  });

export type OfferFormValues = z.input<typeof offerSchema>;
