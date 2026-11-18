import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View, type ViewProps } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { palette } from '@/theme/tokens';

import {
  buildNeedsMapHtml,
  serializeMapNeeds,
  type MapCenter,
  type MapMarkerNeed,
} from './map-template';

export interface NeedsMapProps extends ViewProps {
  needs: MapMarkerNeed[];
  center: MapCenter;
  onNeedPress: (needId: string) => void;
}

export function NeedsMap({ needs, center, onNeedPress, ...props }: NeedsMapProps) {
  const webViewRef = useRef<WebView>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const { latitude, longitude } = center;
  const html = useMemo(() => buildNeedsMapHtml({ latitude, longitude }), [latitude, longitude]);
  const payload = useMemo(() => serializeMapNeeds(needs), [needs]);

  useEffect(() => {
    if (!readyRef.current) {
      pendingRef.current = payload;
      return;
    }

    webViewRef.current?.injectJavaScript(`window.__setNeeds(${payload}); true;`);
  }, [payload]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as { type?: string; id?: string };

      if (data.type === 'need' && typeof data.id === 'string') {
        onNeedPress(data.id);
      }
    } catch {
      return;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }} {...props}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        onLoadEnd={() => {
          readyRef.current = true;
          const pending = pendingRef.current ?? '[]';
          pendingRef.current = null;
          webViewRef.current?.injectJavaScript(`window.__setNeeds(${pending}); true;`);
        }}
        startInLoadingState
        renderLoading={() => (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: palette.bg,
            }}
          >
            <ActivityIndicator size="small" color={palette.brand} />
          </View>
        )}
        style={{ flex: 1, backgroundColor: palette.bg }}
      />
    </View>
  );
}
