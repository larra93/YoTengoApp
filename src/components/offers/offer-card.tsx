import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { View } from 'react-native';

import { AppText, Avatar, Badge, Button, Card, type BadgeTone } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatClp, getInitials } from '@/lib/format';
import { OFFER_STATUS_LABEL } from '@/lib/labels';
import type { OfferStatus, OfferWithSupplier } from '@/types';

const STATUS_TONE: Record<OfferStatus, BadgeTone> = {
  pending: 'neutral',
  accepted: 'success',
  rejected: 'danger',
};

export interface OfferCardProps {
  offer: OfferWithSupplier;
  onAccept?: () => void;
  onReject?: () => void;
  onChat?: () => void;
  className?: string;
}

export function OfferCard({ offer, onAccept, onReject, onChat, className }: OfferCardProps) {
  const supplierName = offer.supplier?.full_name ?? 'Vecino';

  return (
    <Card className={cn('gap-3', className)}>
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 flex-row items-center gap-2.5">
          <Avatar size="md" initials={getInitials(supplierName)} />
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle" className="text-[14px]" numberOfLines={1}>
              {supplierName}
            </AppText>
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={11} color="#F59E0B" />
              <AppText variant="caption">
                {offer.supplier ? offer.supplier.rating_avg.toFixed(1) : 'Nuevo'}
                {offer.supplier?.neighborhood ? ` · ${offer.supplier.neighborhood}` : ''}
              </AppText>
            </View>
          </View>
        </View>
        <View className="items-end gap-1">
          <Badge
            label={OFFER_STATUS_LABEL[offer.status]}
            tone={STATUS_TONE[offer.status]}
            icon={offer.status === 'accepted' ? 'checkmark-circle' : undefined}
          />
          <AppText variant="caption" className="text-[10px]">
            {formatDistanceToNow(parseISO(offer.created_at), { addSuffix: true, locale: es })}
          </AppText>
        </View>
      </View>

      <View className="rounded-xl bg-slate-50 p-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-2.5">
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-soft">
              <Ionicons name="cube-outline" size={18} color="#115E59" />
            </View>
            <View className="flex-1 gap-0.5">
              <AppText variant="subtitle" className="text-[13px]" numberOfLines={1}>
                {offer.swap_offered_details ?? 'Oferta de servicio'}
              </AppText>
              <AppText variant="caption" numberOfLines={2}>
                {offer.conditions ?? 'Sin condiciones adicionales'}
              </AppText>
            </View>
          </View>
          <AppText variant="price" className="text-brand-dark">
            {offer.price_offered !== null ? formatClp(offer.price_offered) : 'A convenir'}
          </AppText>
        </View>
      </View>

      {offer.status === 'pending' ? (
        <View className="flex-row gap-2">
          <Button
            variant="ghost"
            size="sm"
            label="Chat"
            onPress={onChat}
            className="flex-1"
            icon={<Ionicons name="chatbubble-outline" size={13} color="#475569" />}
          />
          <Button
            variant="ghost"
            size="sm"
            label="Rechazar"
            onPress={onReject}
            className="flex-1"
            textClassName="text-danger"
          />
          <Button size="sm" label="Aceptar" onPress={onAccept} className="flex-1" />
        </View>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          label="Abrir chat"
          onPress={onChat}
          icon={<Ionicons name="chatbubble-outline" size={13} color="#475569" />}
        />
      )}
    </Card>
  );
}
