// "Kate vond": the full finding cards under the Kate bar (D15), with the buttons to act on each one.
// Visuals from the phase-1 Kate card: Kate logo, eyebrow, text, pill buttons.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DelingStatus } from '../world/state/reducer';
import type { Finding, FindingCommand } from '../world/types';
import { font, shadow, world } from '../theme';
import { KateLogoIcon } from './KateLogoIcon';
import { PillButton } from './ui';

const FIRST = 3;

function eyebrow(finding: Finding, je: string) {
  if (finding.kind === 'moment') return finding.actions.some((a) => a.command === 'confirm') ? 'Kate vraagt' : 'Klaar voor de geboorte';
  if (finding.kind === 'arrived') return `Nieuw in ${je} wereld`;
  return finding.kind === 'all-good' ? 'Kate denkt mee' : 'Kate vond';
}

export function KateFindings({
  findings,
  je,
  deling,
  onCommand,
}: {
  findings: Finding[];
  /** "je" or "jullie". */
  je: string;
  deling: Record<string, DelingStatus>;
  onCommand: (finding: Finding, command: FindingCommand) => void;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? findings : findings.slice(0, FIRST);
  return (
    <View style={styles.list}>
      {shown.map((f) => (
        <FindingCard key={f.id} finding={f} je={je} deling={f.link ? deling[f.link.ref] : undefined} onCommand={onCommand} />
      ))}
      {findings.length > FIRST && (
        <PillButton label={all ? 'Toon minder' : `Toon meer (${findings.length - FIRST})`} variant="secondary" onPress={() => setAll((a) => !a)} />
      )}
    </View>
  );
}

function FindingCard({
  finding,
  je,
  deling,
  onCommand,
}: {
  finding: Finding;
  je: string;
  deling?: DelingStatus;
  onCommand: (finding: Finding, command: FindingCommand) => void;
}) {
  const [why, setWhy] = useState(false);
  const glow = finding.kind === 'moment' || finding.kind === 'arrived';
  const connecting = deling === 'connecting';
  const dismissable = finding.actions.some((a) => a.command === 'dismiss');
  return (
    <View style={[styles.card, glow && styles.glow]}>
      <KateLogoIcon size={40} />
      <View style={styles.body}>
        <Text style={styles.eyebrow}>{eyebrow(finding, je)}</Text>
        <Text style={styles.text}>{finding.text}</Text>
        {why && !!finding.reasons?.length && (
          <View style={styles.why}>
            {finding.reasons.map((r) => (
              <View key={r} style={styles.whyRow}>
                <View style={styles.bullet} />
                <Text style={styles.whyText}>{r}</Text>
              </View>
            ))}
          </View>
        )}
        {deling === 'failed' && <Text style={styles.error}>Koppelen lukte niet. Probeer opnieuw.</Text>}
        {finding.actions.length > 0 && (
          <View style={styles.row}>
            {finding.actions
              .filter((a) => a.command !== 'dismiss')
              .map((a, i) => (
                <PillButton
                  key={a.command}
                  small
                  label={a.command === 'connect' && connecting ? 'Koppelen…' : a.label}
                  disabled={a.command === 'connect' && connecting}
                  variant={i === 0 ? 'primary' : a.command === 'why' ? 'link' : 'secondary'}
                  onPress={() => onCommand(finding, a.command)}
                />
              ))}
            {!!finding.reasons?.length && (
              <PillButton small label={why ? 'Verberg' : 'Waarom?'} variant="link" onPress={() => setWhy((w) => !w)} />
            )}
            {dismissable && <PillButton small label="Niet nu" variant="link" onPress={() => onCommand(finding, 'dismiss')} />}
          </View>
        )}
      </View>
      {dismissable && (
        <Pressable role="button" aria-label="Verbergen" onPress={() => onCommand(finding, 'dismiss')} style={styles.close} hitSlop={8}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    backgroundColor: world.card,
    borderRadius: 22,
    padding: 14,
    paddingRight: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    boxShadow: shadow.card,
  },
  glow: { boxShadow: shadow.glow },
  body: { flex: 1, minWidth: 0 },
  eyebrow: { fontFamily: font.body800, fontSize: 12, color: world.blue, letterSpacing: 0.48, textTransform: 'uppercase' },
  text: { fontFamily: font.body400, fontSize: 14, lineHeight: 19.6, color: world.ink, marginTop: 2, marginBottom: 10 },
  why: { gap: 5, marginTop: -4, marginBottom: 10 },
  whyRow: { flexDirection: 'row', gap: 8 },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: world.blue, marginTop: 7 },
  whyText: { fontFamily: font.body600, fontSize: 13, lineHeight: 18, color: world.ink, flex: 1 },
  error: { fontFamily: font.body700, fontSize: 12.5, color: '#b3261e', marginTop: -4, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: world.secondaryBg,
  },
  closeIcon: { fontFamily: font.body800, fontSize: 11, color: world.soft },
});
