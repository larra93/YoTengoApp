export function getOfferErrorMessage(error: unknown) {
  const message =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : '';

  if (message.includes('row-level security') || message.includes('violates row-level security')) {
    return 'No puedes enviar esta oferta. Verifica que el pedido esté abierto y que no sea tuyo.';
  }

  if (message.includes('duplicate key') || message.includes('offers_need_supplier_unique')) {
    return 'Ya enviaste una oferta para este pedido.';
  }

  if (message.includes('Oferta no encontrada o sin permisos')) {
    return 'No tienes permisos para gestionar esta oferta.';
  }

  if (message.includes('No autenticado')) {
    return 'Tu sesión expiró. Vuelve a iniciar sesión.';
  }

  if (message.includes('bucket') || message.includes('storage')) {
    return 'No pudimos subir la imagen de la oferta.';
  }

  return 'No pudimos completar la acción. Intenta nuevamente.';
}
