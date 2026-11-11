export function getReviewErrorMessage(error: unknown) {
  const message =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';

  if (message.includes('Ya evaluaste')) {
    return 'Ya calificaste a esta persona en este pedido.';
  }

  if (message.includes('Solo se puede evaluar una necesidad completada')) {
    return 'La reseña se habilita cuando el pedido está completado.';
  }

  if (message.includes('No participas en esta necesidad')) {
    return 'Solo quienes participaron del trato pueden calificar.';
  }

  if (message.includes('No autenticado')) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  }

  if (message.includes('La calificacion debe estar entre 1 y 5')) {
    return 'Selecciona una calificación entre 1 y 5 estrellas.';
  }

  return 'No pudimos guardar tu reseña. Intenta nuevamente.';
}
