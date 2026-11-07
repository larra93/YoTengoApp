import { format, parseISO } from 'date-fns';
import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ChatMessageWithSender } from '@/types';

export interface MessageBubbleProps {
  message: ChatMessageWithSender;
  mine: boolean;
  showSender?: boolean;
}

export function MessageBubble({ message, mine, showSender }: MessageBubbleProps) {
  return (
    <View
      className={cn('max-w-[82%] gap-1', mine ? 'items-end self-end' : 'items-start self-start')}
    >
      {showSender && !mine ? (
        <AppText variant="caption" className="px-1">
          {message.sender?.full_name ?? 'Vecino'}
        </AppText>
      ) : null}
      <View
        className={cn(
          'rounded-2xl px-3.5 py-2.5',
          mine ? 'rounded-br-md bg-brand' : 'rounded-bl-md border border-line bg-surface',
        )}
      >
        <AppText className={cn('text-sm leading-5', mine ? 'text-white' : 'text-ink')}>
          {message.message}
        </AppText>
      </View>
      <AppText variant="caption" className="px-1 text-[10px]">
        {format(parseISO(message.created_at), 'HH:mm')}
      </AppText>
    </View>
  );
}
