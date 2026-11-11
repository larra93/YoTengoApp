import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MessageBubble } from '@/components/chat';
import { AppText, Avatar, Button, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { getChatErrorMessage } from '@/features/chat/errors';
import {
  useChatAccess,
  useChatMessages,
  useChatRealtime,
  useSendChatMessage,
} from '@/features/chat/use-chat';
import { useNeedDetail } from '@/features/needs/use-needs';
import { useNeedOffers } from '@/features/offers/use-offers';
import { cn } from '@/lib/cn';
import { formatClp, formatDateRange, getInitials } from '@/lib/format';
import { palette } from '@/theme/tokens';

const QUICK_REPLIES = [
  'Hola, ¿sigue disponible?',
  '¿Podemos coordinar por acá?',
  '¿A qué hora te acomoda?',
  'Sí, me sirve. Gracias.',
];

export default function ChatScreen() {
  const { needId } = useLocalSearchParams<{ needId: string; offerId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const resolvedNeedId = Array.isArray(needId) ? needId[0] : needId;
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const needQuery = useNeedDetail(resolvedNeedId);
  const offersQuery = useNeedOffers(resolvedNeedId);
  const accessQuery = useChatAccess(resolvedNeedId, user?.id);
  const messagesQuery = useChatMessages(resolvedNeedId);
  const sendMessage = useSendChatMessage(resolvedNeedId ?? '');
  useChatRealtime(resolvedNeedId);

  const need = needQuery.data;
  const messages = messagesQuery.data ?? [];
  const acceptedOffer = (offersQuery.data ?? []).find((offer) => offer.status === 'accepted');
  const isOwner = Boolean(user?.id && need?.user_id === user.id);
  const derivedOther = messages.find((message) => message.sender_id !== user?.id)?.sender;
  const otherUser = isOwner
    ? (acceptedOffer?.supplier ?? derivedOther)
    : (need?.author ?? derivedOther);
  const otherName = otherUser?.full_name ?? 'Chat del pedido';
  const canSend = input.trim().length > 0 && accessQuery.data === true && !sendMessage.isPending;
  const isLoading =
    needQuery.isLoading ||
    accessQuery.isLoading ||
    (accessQuery.data === true && messagesQuery.isLoading);

  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();

    if (!text || !resolvedNeedId) {
      return;
    }

    setFeedback(null);

    try {
      await sendMessage.mutateAsync(text);
      setInput('');
    } catch (error) {
      setFeedback(getChatErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <Screen className="items-center justify-center gap-3">
        <ActivityIndicator size="large" color={palette.brand} />
        <AppText variant="muted">Cargando chat...</AppText>
      </Screen>
    );
  }

  if (!need) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <Ionicons name="search-outline" size={30} color={palette.placeholder} />
        <AppText variant="title" className="text-center">
          No encontramos este pedido
        </AppText>
        <Button label="Volver" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (accessQuery.data !== true) {
    return (
      <Screen className="items-center justify-center gap-4 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="lock-closed-outline" size={28} color={palette.muted} />
        </View>
        <AppText variant="title" className="text-center">
          El chat aún no está disponible
        </AppText>
        <AppText variant="muted" className="text-center">
          Se habilita cuando el pedido tiene una oferta aceptada y participas en la negociación.
        </AppText>
        <Button
          label="Ver pedido"
          onPress={() => router.push({ pathname: '/need/[id]', params: { id: need.id } })}
        />
        <Button label="Volver" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
          <Pressable
            accessibilityLabel="Volver"
            className="h-10 w-10 items-center justify-center rounded-full"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={19} color={palette.ink} />
          </Pressable>
          <Avatar size="sm" uri={otherUser?.avatar_url} initials={getInitials(otherName) || '?'} />
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle" className="text-[14px]" numberOfLines={1}>
              {otherName}
            </AppText>
            <AppText variant="caption">Chat del pedido</AppText>
          </View>
          <Pressable
            accessibilityLabel="Más opciones"
            className="h-10 w-10 items-center justify-center rounded-full"
            onPress={() =>
              Alert.alert('Opciones del chat', 'Reportar y silenciar llegarán en una próxima fase.')
            }
          >
            <Ionicons name="ellipsis-horizontal" size={19} color={palette.ink} />
          </Pressable>
        </View>

        <Pressable
          className="flex-row items-center gap-2.5 border-b border-line bg-brand-soft px-5 py-2.5"
          onPress={() => router.push({ pathname: '/need/[id]', params: { id: need.id } })}
        >
          <Ionicons name="cube-outline" size={16} color={palette.brandDark} />
          <View className="flex-1">
            <AppText className="text-[11px] font-semibold text-brand-dark" numberOfLines={1}>
              {need.title}
            </AppText>
            <AppText className="text-[10px] font-medium text-brand-dark/80">
              {acceptedOffer?.price_offered !== null && acceptedOffer?.price_offered !== undefined
                ? formatClp(acceptedOffer.price_offered)
                : (acceptedOffer?.swap_offered_details ?? 'A convenir')}
              {' · '}
              {formatDateRange(need.start_date, need.end_date)}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={14} color={palette.brandDark} />
        </Pressable>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length > 0 ? (
            <View className="gap-3">
              {messages.map((message, index) => {
                const mine = message.sender_id === user?.id;
                const previous = messages[index - 1];
                const showSender = !mine && (!previous || previous.sender_id !== message.sender_id);

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    mine={mine}
                    showSender={showSender}
                  />
                );
              })}
            </View>
          ) : (
            <View className="items-center gap-2 rounded-card border border-dashed border-slate-300 bg-surface px-6 py-10">
              <Ionicons name="chatbubble-ellipses-outline" size={28} color={palette.placeholder} />
              <AppText variant="subtitle" className="text-center">
                Aún no hay mensajes
              </AppText>
              <AppText variant="caption" className="text-center">
                Saluda y coordinen los detalles de la entrega.
              </AppText>
            </View>
          )}
        </ScrollView>

        {feedback ? (
          <View className="mx-4 mb-2 rounded-xl border border-danger/20 bg-danger-soft p-2.5">
            <AppText className="text-[11px] font-semibold text-danger">{feedback}</AppText>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-t border-line bg-bg"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {QUICK_REPLIES.map((reply) => (
            <Pressable
              key={reply}
              className="rounded-full border border-line bg-surface px-3 py-2"
              onPress={() => setInput(reply)}
            >
              <AppText className="text-[11px] font-semibold text-slate-600">{reply}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        <View
          className="border-t border-line bg-surface px-4 pt-2.5"
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
          <View className="flex-row items-end gap-2">
            <Pressable
              accessibilityLabel="Adjuntar"
              className="h-11 w-11 items-center justify-center rounded-full border border-line"
              onPress={() =>
                Alert.alert('Adjuntos', 'Las fotos en el chat llegarán en una próxima fase.')
              }
            >
              <Ionicons name="add" size={21} color={palette.muted} />
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={palette.placeholder}
              multiline
              maxLength={2000}
              className="max-h-24 min-h-11 flex-1 rounded-2xl border border-line bg-bg px-3.5 py-2.5 text-sm text-ink"
            />
            <Pressable
              accessibilityLabel="Enviar mensaje"
              disabled={!canSend}
              onPress={handleSend}
              className={cn(
                'h-11 w-11 items-center justify-center rounded-full',
                canSend ? 'bg-brand' : 'bg-slate-200',
              )}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={17} color={canSend ? '#FFFFFF' : palette.placeholder} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
