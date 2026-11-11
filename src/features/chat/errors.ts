export function getChatErrorMessage(error: unknown) {
  const message =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';

  if (message.includes('No hay oferta aceptada')) {
    return 'El chat se habilita cuando hay una oferta aceptada.';
  }

  if (message.includes('row-level security') || message.includes('permission denied')) {
    return 'No tienes acceso a este chat.';
  }

  if (message.includes('No autenticado')) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  }

  return 'No pudimos enviar el mensaje. Intenta nuevamente.';
}
