import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemePalette } from '@/hooks/use-theme-palette';
import type { ChatMessage } from '@/types/chat';

interface Props {
  message: ChatMessage;
  isMine: boolean;
  onRetry?: (message: ChatMessage) => void;
}

function StatusIcon({ message }: { message: ChatMessage }) {
  const palette = useThemePalette();

  switch (message.status) {
    case 'sending':
      return (
        <ThemedText variant='caption' color={palette.textMuted} style={styles.statusIcon}>
          {'○'}
        </ThemedText>
      );
    case 'sent':
      return (
        <ThemedText variant='caption' color={palette.textMuted} style={styles.statusIcon}>
          {'✓'}
        </ThemedText>
      );
    case 'delivered':
      return (
        <ThemedText variant='caption' color={palette.textMuted} style={styles.statusIcon}>
          {'✓✓'}
        </ThemedText>
      );
    case 'read':
      return (
        <ThemedText variant='caption' color={palette.ctaBlue} style={styles.statusIcon}>
          {'✓✓'}
        </ThemedText>
      );
    case 'failed':
      return (
        <ThemedText variant='caption' color={palette.accentRed} style={styles.statusIcon}>
          {'!'}
        </ThemedText>
      );
    default:
      return null;
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, isMine, onRetry }: Props) {
  const palette = useThemePalette();

  const bubbleStyle = isMine
    ? [styles.bubble, styles.bubbleMine, { backgroundColor: palette.brandBlue }]
    : [styles.bubble, styles.bubbleTheirs, { backgroundColor: palette.surface }];

  const textColor = isMine ? '#ffffff' : palette.white;

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      {!isMine && (
        <ThemedText variant='caption' color={palette.textMuted} style={styles.authorName}>
          {message.authorName}
        </ThemedText>
      )}

      <View style={bubbleStyle}>
        <ThemedText variant='body' color={textColor} style={styles.content}>
          {message.content}
        </ThemedText>

        <View style={styles.meta}>
          <ThemedText
            variant='caption'
            color={isMine ? 'rgba(255,255,255,0.65)' : palette.textMuted}
            style={styles.timestamp}
          >
            {formatTime(message.createdAt)}
          </ThemedText>

          {isMine && <StatusIcon message={message} />}
        </View>
      </View>

      {isMine && message.status === 'failed' && onRetry && (
        <TouchableOpacity onPress={() => onRetry(message)} style={styles.retryButton}>
          <ThemedText variant='caption' color={palette.accentRed}>
            Retry
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    maxWidth: '80%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  authorName: {
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 4,
  },
  content: {
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  timestamp: {
    fontFamily: 'IBMPlexMono-Light',
    fontSize: 10,
  },
  statusIcon: {
    fontSize: 11,
  },
  retryButton: {
    marginTop: 2,
    paddingHorizontal: 4,
  },
});
