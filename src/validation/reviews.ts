import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z
    .number()
    .int('Selecciona una calificación entera')
    .min(1, 'Selecciona al menos 1 estrella')
    .max(5, 'La calificación máxima es 5 estrellas'),
  comment: z.string().trim().max(500, 'El comentario no puede superar los 500 caracteres.'),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
