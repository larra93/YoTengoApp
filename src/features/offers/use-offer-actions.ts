import { Alert } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';

import { getOfferErrorMessage } from './errors';
import { useAcceptOffer, useRejectOffer } from './use-offers';

export function useOfferActions() {
  const { user } = useAuth();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();

  const handleAccept = (offerId: string, supplierName: string) => {
    Alert.alert('Aceptar oferta', `¿Confirmas la oferta de ${supplierName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceptar',
        onPress: async () => {
          try {
            await acceptOffer.mutateAsync(offerId);
            Alert.alert('Match creado', 'Ya pueden coordinar por el chat del pedido.');
          } catch (error) {
            Alert.alert('No pudimos aceptar', getOfferErrorMessage(error));
          }
        },
      },
    ]);
  };

  const handleReject = (offerId: string) => {
    Alert.alert(
      'Rechazar oferta',
      '¿Quieres descartar esta oferta? El vecino podrá seguir viendo tu pedido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectOffer.mutateAsync(offerId);
            } catch (error) {
              Alert.alert('No pudimos rechazar', getOfferErrorMessage(error));
            }
          },
        },
      ],
    );
  };

  return {
    handleAccept,
    handleReject,
    acceptPending: acceptOffer.isPending,
    rejectPending: rejectOffer.isPending,
    userId: user?.id,
  };
}
