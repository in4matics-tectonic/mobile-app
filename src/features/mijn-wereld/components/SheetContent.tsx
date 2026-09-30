// Domain detail and "Waarom vraag ik dit?" sheets.

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DomainInfo, Signal } from '../state/types';
import { font, world } from '../theme';
import { PillButton } from './ui';

export function SheetTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <Text role="heading" aria-level={2} style={sheetStyles.title}>
        {title}
      </Text>
      <Text style={sheetStyles.sub}>{subtitle}</Text>
    </>
  );
}

export function Tip({ children }: { children: ReactNode }) {
  return <Text style={sheetStyles.tip}>{children}</Text>;
}

export function DomainSheet({ domain, onClose }: { domain: DomainInfo; onClose: () => void }) {
  return (
    <>
      <SheetTitle title={domain.title} subtitle={domain.detail.subtitle} />
      <View style={styles.facts}>
        {domain.detail.facts.map(([label, value]) => (
          <View key={label} style={styles.fact}>
            <Text style={styles.factLabel}>{label}</Text>
            <Text style={styles.factValue}>{value}</Text>
          </View>
        ))}
      </View>
      <Tip>{domain.detail.tip}</Tip>
      <PillButton label="Sluiten" onPress={onClose} />
    </>
  );
}

export function WhySheet({
  signals,
  canAnswer,
  onConfirm,
  onReject,
}: {
  signals: Signal[];
  canAnswer: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  return (
    <>
      <SheetTitle
        title="Waarom vraag ik dit?"
        subtitle="Deze signalen deden me denken dat er iets verandert. Ik heb er nog niets mee gedaan."
      />
      <View style={styles.why}>
        {signals.map((s) => (
          <View key={s.id} style={styles.whyRow}>
            <View style={styles.bullet} />
            <Text style={styles.whyText}>{s.customerLabel}</Text>
          </View>
        ))}
      </View>
      <Tip>
        Jullie kiezen zelf welke data ik mag gebruiken via &apos;Op jouw maat&apos;. Zeggen jullie nee,
        dan wis ik deze inschatting.
      </Tip>
      {canAnswer && (
        <View style={styles.row}>
          <PillButton label="Bevestigen" onPress={onConfirm} />
          <PillButton label="Klopt niet" variant="secondary" onPress={onReject} />
        </View>
      )}
    </>
  );
}

export const sheetStyles = StyleSheet.create({
  title: { fontFamily: font.display700, fontSize: 22, color: world.ink, marginBottom: 2 },
  sub: { fontFamily: font.body600, fontSize: 13, color: world.soft, marginBottom: 12 },
  tip: {
    backgroundColor: world.tip,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: font.body600,
    fontSize: 13.5,
    lineHeight: 19,
    color: world.ink,
    marginBottom: 14,
    overflow: 'hidden',
  },
});

const styles = StyleSheet.create({
  facts: { gap: 8, marginBottom: 14 },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: world.line,
    paddingBottom: 7,
  },
  factLabel: { fontFamily: font.body600, fontSize: 14, color: world.soft },
  factValue: {
    fontFamily: font.body800,
    fontSize: 14,
    color: world.ink,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  why: { gap: 6, marginBottom: 14 },
  whyRow: { flexDirection: 'row', gap: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: world.blue, marginTop: 7 },
  whyText: { fontFamily: font.body600, fontSize: 13.5, lineHeight: 19, color: world.ink, flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
