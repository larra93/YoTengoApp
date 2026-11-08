const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'invalid login credentials': 'Correo o contraseña incorrectos.',
  'email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  'user already registered': 'Ya existe una cuenta con este correo.',
  'password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres.',
  'email rate limit exceeded': 'Demasiados intentos. Espera un momento y vuelve a intentar.',
  'signup requires a valid password': 'Ingresa una contraseña válida.',
  'new password should be different from the old password':
    'La nueva contraseña debe ser distinta de la anterior.',
};

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();
    const translated = AUTH_ERROR_MESSAGES[normalized];

    if (translated) {
      return translated;
    }

    if (normalized.includes('network request failed')) {
      return 'No pudimos conectar con el servidor. Revisa tu conexión.';
    }

    return error.message;
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}
