import type { DealType, NeedStatus, OfferStatus } from '@/types';

export const DEAL_TYPE_LABEL: Record<DealType, string> = {
  rent: 'Arriendo',
  loan: 'Préstamo',
  swap: 'Trueque',
};

export const DEAL_TYPE_ICON = {
  rent: 'key-outline',
  loan: 'repeat-outline',
  swap: 'swap-horizontal-outline',
} as const;

export const NEED_STATUS_LABEL: Record<NeedStatus, string> = {
  open: 'Abierto',
  matched: 'Matched',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};
