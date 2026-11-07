import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
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
import { AppText, Avatar, Screen } from '@/components/ui';
import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/format';
import {
  CURRENT_USER_ID,
  getMockChatMessages,
  MOCK_ALL_OFFERS,
  MOCK_CURRENT_PUBLIC_PROFILE,
  MOCK_NEEDS,
  MOCK_QUICK_REPLIES,
  MOCK_RECEIVED_OFFERS,
} from '@/mocks/data';
import { palette } from '@/theme/tokens';
import type { ChatMessageWithSender } from '@/types';

export default function ChatScreen() {
  const { needId, offerId } = useLocalSearchParams<{ needId: string; offerId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const localMessageId = useRef(0);
  const need = MOCK_NEEDS.find((item) => item.id === needId) ?? MOCK_NEEDS[0];
  const offer = MOCK_ALL_OFFERS.find((item) => item.id === offerId);
  const otherUser =
    offer?.supplier && offer.supplier_id !== CURRENT_USER_ID
      ? offer.supplier
      : need.author && need.author.id !== CURRENT_USER_ID
        ? need.author
        : (MOCK_RECEIVED_OFFERS.find((item) => item.need_id === need.id)?.supplier ??
          MOCK_CURRENT_PUBLIC_PROFILE);
  const [messages, setMessages] = useState<ChatMessageWithSender[]>(() =>
    getMockChatMessages(need, otherUser),
  );
  const [input, setInput] = useState('');
  const canSend = input.trim().length > 0;

  const handleSend = () => {
    const text = input.trim();

    if (!text) {
      return;
    }

    localMessageId.current += 1;

    const newMessage: ChatMessageWithSender = {
      id: `local-${localMessageId.current}`,
      need_id: need.id,
      offer_id: 'offer-1',
      sender_id: CURRENT_USER_ID,
      receiver_id: otherUser.id,
      message: text,
      created_at: new Date().toISOString(),
      sender: MOCK_CURRENT_PUBLIC_PROFILE,
    };

    setMessages((current) => [...current, newMessage]);
    setInput('');
  };

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
          <Avatar size="sm" initials={getInitials(otherUser.full_name)} online />
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle" className="text-[14px]">
              {otherUser.full_name}
            </AppText>
            <AppText variant="caption">En línea</AppText>
          </View>
          <Pressable
            accessibilityLabel="Más opciones"
            className="h-10 w-10 items-center justify-center rounded-full"
            onPress={() =>
              Alert.alert(
                'Opciones del chat',
                'Reportar, silenciar y bloquear llegarán en la Fase 5.',
              )
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
          <AppText className="flex-1 text-[11px] font-semibold text-brand-dark" numberOfLines={1}>
            {need.title} · {need.budget_or_offer_details ?? 'A convenir'}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={palette.brandDark} />
        </Pressable>

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View className="gap-3">
            {messages.map((message, index) => {
              const mine = message.sender_id === CURRENT_USER_ID;
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
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="border-t border-line bg-bg"
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {MOCK_QUICK_REPLIES.map((reply) => (
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
              onPress={() => Alert.alert('Adjuntos', 'Las fotos en el chat llegarán en la Fase 5.')}
            >
              <Ionicons name="add" size={21} color={palette.muted} />
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={palette.placeholder}
              multiline
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
              <Ionicons name="send" size={17} color={canSend ? '#FFFFFF' : palette.placeholder} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
