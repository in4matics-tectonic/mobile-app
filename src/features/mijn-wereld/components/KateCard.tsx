// Kate's message and actions. Content depends only on the phase.

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DONE_BONUS_COINS } from '../mocks/tomEnLien';
import type { Phase } from '../state/types';
import { font, shadow, world } from '../theme';
import { KateLogoIcon } from './KateLogoIcon';
import { PillButton } from './ui';

interface Props {
  phase: Phase;
  consents: string[];
  readyCount: number;
  openCount: number;
  checklistLoaded: boolean;
  onConfirm: () => void;
  onReject: () => void;
  onWhy: () => void;
  onShowChecklist: () => void;
}

export function KateCard(props: Props) {
  const glow = props.phase === 'ask' || props.phase === 'confirmed';
  return (
    <View style={[styles.card, glow && styles.glow]}>
      <KateLogoIcon size={40} />
      <View style={styles.body} aria-live="polite">
        <Content {...props} />
      </View>
    </View>
  );
}

function Content({
  phase,
  consents,
  readyCount,
  openCount,
  checklistLoaded,
  onConfirm,
  onReject,
  onWhy,
  onShowChecklist,
}: Props) {
  switch (phase) {
    case 'signals':
      return (
        <>
          <Who>Kate denkt mee</Who>
          <Message>
            Alles staat goed. Jullie huis en auto zijn in orde en de spaarbuffer groeit mooi.
          </Message>
          <Consent items={consents} />
        </>
      );
    case 'ask':
      return (
        <>
          <Who>Kate</Who>
          <Message>
            Ik vermoed dat er een <Bold>gezinsuitbreiding</Bold> op komst is bij jullie. Klopt dat?
          </Message>
          <View style={styles.row}>
            <PillButton label="Bevestigen" onPress={onConfirm} />
            <PillButton label="Klopt niet" variant="secondary" onPress={onReject} />
            <PillButton label="Waarom?" variant="link" onPress={onWhy} />
          </View>
        </>
      );
    case 'declined':
      return (
        <>
          <Who>Kate</Who>
          <Message>
            Bedankt om het te laten weten. Ik stop met deze suggesties en wis deze inschatting.
          </Message>
        </>
      );
    case 'confirmed':
      return (
        <>
          <Who>Kate · klaar voor de geboorte</Who>
          <Message>
            <Bold>Proficiat!</Bold>{' '}
            {!checklistLoaded ? (
              'Ik zet jullie checklist klaar…'
            ) : openCount === 0 ? (
              'Alles is in orde.'
            ) : (
              <>
                {readyCount} dingen zijn al in orde, nog <Bold>{openCount}</Bold> te regelen.
              </>
            )}
          </Message>
          {checklistLoaded && (
            <View style={styles.row}>
              <PillButton label="Bekijk checklist" onPress={onShowChecklist} />
            </View>
          )}
        </>
      );
    case 'done':
      return (
        <>
          <Who>Klaar voor de geboorte</Who>
          <Message>
            Alles is geregeld. Jullie kleine spruit is vanaf dag één beschermd. Als welkom:{' '}
            <Bold>+{DONE_BONUS_COINS} Kate Coins</Bold> op het spaarplan.
          </Message>
          <Consent items={['beheer je toestemmingen']} />
        </>
      );
  }
}

const Who = ({ children }: { children: ReactNode }) => <Text style={styles.who}>{children}</Text>;
const Message = ({ children }: { children: ReactNode }) => (
  <Text style={styles.message}>{children}</Text>
);
const Bold = ({ children }: { children: ReactNode }) => <Text style={styles.bold}>{children}</Text>;

function Consent({ items }: { items: string[] }) {
  return (
    <View style={styles.consent} aria-label={`Op jouw maat: ${items.join(', ')}`}>
      <Text style={styles.consentLabel}>Op jouw maat</Text>
      {items.map((item) => (
        <Text key={item} style={styles.consentChip}>
          {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: world.card,
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    boxShadow: shadow.card,
  },
  glow: { boxShadow: shadow.glow },
  body: { flex: 1, minWidth: 0 },
  who: {
    fontFamily: font.body800,
    fontSize: 12,
    color: world.blue,
    letterSpacing: 0.48,
    textTransform: 'uppercase',
  },
  message: {
    fontFamily: font.body400,
    fontSize: 14,
    lineHeight: 19.6,
    color: world.ink,
    marginTop: 2,
    marginBottom: 10,
  },
  bold: { fontFamily: font.body800 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  consent: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: -2 },
  consentLabel: { fontFamily: font.body700, fontSize: 11.5, color: world.soft },
  consentChip: {
    fontFamily: font.body700,
    fontSize: 11.5,
    backgroundColor: '#eef7f0',
    color: '#1d7a45',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
});
