import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa tu correo.')
  .email('Ingresa un correo válido.');

const passwordSchema = z
  .string()
  .min(8, 'Usa al menos 8 caracteres.')
  .max(72, 'La contraseña no puede superar los 72 caracteres.');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Ingresa tu nombre completo.')
      .max(80, 'El nombre no puede superar los 80 caracteres.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Repite tu contraseña.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden.',
  });

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Ingresa tu nombre completo.')
    .max(80, 'El nombre no puede superar los 80 caracteres.'),
  neighborhood: z
    .string()
    .trim()
    .min(2, 'Indica tu barrio o comuna.')
    .max(80, 'El barrio no puede superar los 80 caracteres.'),
  phone: z
    .string()
    .trim()
    .max(20, 'El teléfono no puede superar los 20 caracteres.')
    .refine(
      (value) => value.length === 0 || /^[+0-9 ()-]{6,20}$/.test(value),
      'Ingresa un teléfono válido.',
    ),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
