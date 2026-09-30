// On wide web screens the product is shown inside a 390×812 phone (12px bezel, 52px radius).
// Below 430px, and on iOS/Android, the bezel drops away and the screen fills the viewport.

import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { PHONE, shadow } from '../theme';

export function usePhoneFramed() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width > PHONE.frameBreakpoint;
}

export function PhoneFrame({ background, children }: { background: string; children: ReactNode }) {
  const framed = usePhoneFramed();

  if (!framed) return <View style={styles.fullscreen}>{children}</View>;

  return (
    <ScrollView
      style={{ backgroundColor: background }}
      contentContainerStyle={styles.page}>
      <View style={styles.phone}>
        <View style={styles.screen}>{children}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, overflow: 'hidden' },
  page: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  phone: {
    width: PHONE.width,
    maxWidth: '100%',
    backgroundColor: '#0b1220',
    borderRadius: PHONE.radius,
    padding: PHONE.bezel,
    boxShadow: shadow.phone,
  },
  screen: {
    height: PHONE.height,
    borderRadius: PHONE.radius - 10,
    overflow: 'hidden',
  },
});
