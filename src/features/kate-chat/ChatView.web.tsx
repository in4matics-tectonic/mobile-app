// Web: react-native-webview has no web support, so the chat page goes in an iframe.

import { forwardRef, useImperativeHandle, useRef } from 'react';

import type { ChatViewHandle } from './types';

export const ChatView = forwardRef<ChatViewHandle, { url: string; onLoad: () => void }>(function ChatView({ url, onLoad }, ref) {
  const frame = useRef<HTMLIFrameElement>(null);
  useImperativeHandle(ref, () => ({
    post: (message) => frame.current?.contentWindow?.postMessage(message, new URL(url, window.location.href).origin),
  }));
  return (
    <iframe
      ref={frame}
      src={url}
      title="Kate"
      onLoad={onLoad}
      style={{ border: 0, width: '100%', height: '100%', display: 'block', background: '#fff' }}
    />
  );
});
