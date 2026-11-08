export function getNeedErrorMessage(error: unknown) {
  const message =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';

  if (message.includes('permission denied')) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (message.includes('No autenticado')) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  }

  if (message.includes('check constraint')) {
    return 'Revisa los datos ingresados e intenta nuevamente.';
  }

  if (message.includes('Coordenadas invalidas')) {
    return 'No pudimos obtener una ubicación válida.';
  }

  return 'No pudimos completar la acción. Intenta nuevamente.';
}
