import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { ChatMessageWithSender, PublicProfile } from '@/types';

const PUBLIC_PROFILE_SELECT = 'id, full_name, avatar_url, rating_avg, rating_count, neighborhood';

const MESSAGE_SELECT = `
  id, need_id, offer_id, sender_id, receiver_id, message, created_at,
  sender:profiles!chat_messages_sender_id_fkey(${PUBLIC_PROFILE_SELECT})
`;

type ChatRow = Database['public']['Tables']['chat_messages']['Row'];
type PublicProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'rating_count' | 'neighborhood'
>;
type ChatRowWithSender = ChatRow & {
  sender: PublicProfileRow | null;
};

const MESSAGE_WITH_NEED_SELECT = `${MESSAGE_SELECT}, need:needs!chat_messages_need_id_fkey(id, title)`;

type ChatRowWithNeed = ChatRowWithSender & {
  need: { id: string; title: string } | null;
};

function toPublicProfile(row: PublicProfileRow | null): PublicProfile | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    rating_avg: row.rating_avg,
    rating_count: row.rating_count,
    neighborhood: row.neighborhood,
  };
}

function mapMessageRow(row: ChatRowWithSender): ChatMessageWithSender {
  return {
    id: row.id,
    need_id: row.need_id,
    offer_id: row.offer_id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id,
    message: row.message,
    created_at: row.created_at,
    sender: toPublicProfile(row.sender),
  };
}

export async function listChatMessages(needId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(MESSAGE_SELECT)
    .eq('need_id', needId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as ChatRowWithSender[]).map(mapMessageRow);
}

export async function listRecentIncomingMessages(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(MESSAGE_WITH_NEED_SELECT)
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as ChatRowWithNeed[]).map((row) => ({
    ...mapMessageRow(row),
    need: row.need,
  }));
}

export async function sendChatMessage(needId: string, body: string) {
  const { data, error } = await supabase.rpc('send_message', {
    p_need_id: needId,
    p_body: body,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function canAccessChat(needId: string, userId: string) {
  return supabase.rpc('can_access_chat', { p_need_id: needId, p_user_id: userId });
}
