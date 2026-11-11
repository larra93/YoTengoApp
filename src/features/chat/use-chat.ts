import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

import { queryKeys } from '@/lib/query-keys';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types';

import { canAccessChat, listChatMessages, sendChatMessage } from './api';

export function useChatMessages(needId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.byNeed(needId ?? ''),
    queryFn: () => listChatMessages(needId as string),
    enabled: Boolean(needId),
  });
}

export function useChatAccess(needId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.access(needId ?? '', userId ?? ''),
    queryFn: async () => {
      const { data, error } = await canAccessChat(needId as string, userId as string);
      if (error) {
        throw error;
      }
      return Boolean(data);
    },
    enabled: Boolean(needId && userId),
  });
}

export function useSendChatMessage(needId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => sendChatMessage(needId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.byNeed(needId) });
    },
  });
}

export function useChatRealtime(needId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!needId) {
      return;
    }

    const channel = supabase
      .channel(`chat:${needId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `need_id=eq.${needId}`,
        },
        (_payload: RealtimePostgresChangesPayload<ChatMessage>) => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.chat.byNeed(needId) });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [needId, queryClient]);
}
