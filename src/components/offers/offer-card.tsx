import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

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
  canManage?: boolean;
  showNeed?: boolean;
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onChat?: () => void;
  className?: string;
}

export function OfferCard({
  offer,
  canManage = true,
  showNeed = false,
  onPress,
  onAccept,
  onReject,
  onChat,
  className,
}: OfferCardProps) {
  const supplierName = offer.supplier?.full_name ?? 'Vecino';
  const showActions = canManage && offer.status === 'pending';
  const showChat = offer.status === 'accepted';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      className={cn(onPress && 'active:opacity-80')}
    >
      <Card className={cn('gap-3', className)}>
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 flex-row items-center gap-2.5">
            <Avatar
              size="md"
              uri={offer.supplier?.avatar_url}
              initials={getInitials(supplierName)}
            />
            <View className="flex-1 gap-0.5">
              <AppText variant="subtitle" className="text-[14px]" numberOfLines={1}>
                {supplierName}
              </AppText>
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={11} color="#F59E0B" />
                <AppText variant="caption">
                  {offer.supplier ? Number(offer.supplier.rating_avg).toFixed(1) : 'Nuevo'}
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

        {showNeed && offer.need ? (
          <View className="flex-row items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <Ionicons name="pricetag-outline" size={13} color="#64748B" />
            <AppText variant="caption" className="flex-1 text-[11px]" numberOfLines={1}>
              {offer.need.title}
            </AppText>
          </View>
        ) : null}

        <View className="flex-row items-center gap-3">
          {offer.item_photo_url ? (
            <Image
              source={offer.item_photo_url}
              style={{ width: 56, height: 56 }}
              contentFit="cover"
              transition={200}
              className="rounded-lg bg-slate-100"
            />
          ) : (
            <View className="h-14 w-14 items-center justify-center rounded-lg bg-brand-soft">
              <Ionicons name="cube-outline" size={22} color="#115E59" />
            </View>
          )}
          <View className="flex-1 rounded-xl bg-slate-50 p-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-0.5">
                <AppText variant="subtitle" className="text-[13px]" numberOfLines={1}>
                  {offer.swap_offered_details ?? 'Oferta de servicio'}
                </AppText>
                <AppText variant="caption" numberOfLines={2}>
                  {offer.conditions ?? 'Sin condiciones adicionales'}
                </AppText>
              </View>
              <AppText variant="price" className="text-brand-dark">
                {offer.price_offered !== null ? formatClp(offer.price_offered) : 'A convenir'}
              </AppText>
            </View>
          </View>
        </View>

        {showActions ? (
          <View className="flex-row gap-2">
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
        ) : showChat ? (
          <Button
            variant="ghost"
            size="sm"
            label="Abrir chat"
            onPress={onChat}
            icon={<Ionicons name="chatbubble-outline" size={13} color="#475569" />}
          />
        ) : offer.status === 'pending' ? (
          <View className="flex-row items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2">
            <Ionicons name="time-outline" size={13} color="#B45309" />
            <AppText variant="caption" className="text-[11px] text-amber-800">
              Esperando la respuesta del vecino
            </AppText>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}
