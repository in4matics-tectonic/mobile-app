// A proposal that just came in, from Kate (the agent, on her own) or from an adviser. It should feel like a small
// gift: a sky-coloured card bounces in over the world, confetti bursts from Kate's logo, and one tap says yes.
// "Later" keeps it as a finding card below the world.

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import type { Kans } from '../services/kbcApi';
import { linkLabel, type Voice } from '../world/labels';
import { font, shadow, world } from '../theme';
import { KateLogoIcon } from './KateLogoIcon';
import { PillButton } from './ui';

const CONFETTI = ['#ffd34d', '#ff8a66', '#7cc0ff', '#3ccf8e', '#c084fc', '#ffd34d', '#ff6b9a', '#7cc0ff', '#3ccf8e', '#ffb340', '#c084fc', '#ff8a66'];

/** A picture for what's on offer, so the card reads at a glance. */
function picture(k: Kans) {
  if (k.link.soort === 'koppeling') return '🤝';
  if (/save|spaar|savings/i.test(k.link.ref)) return '🐷';
  if (k.link.ecosysteem === 'ENERGIE') return '🌱';
  if (k.link.ecosysteem === 'MOBILITEIT') return '🚲';
  return '🎁';
}

export function KansPopup({
  kans,
  voice,
  reduced,
  onAnswer,
  onLater,
}: {
  kans: Kans | null;
  voice: Voice;
  reduced: boolean;
  onAnswer: (k: Kans) => void;
  onLater: () => void;
}) {
  const open = useSharedValue(0);
  const burst = useSharedValue(0);
  const glow = useSharedValue(0);
  const bob = useSharedValue(0);
  // Keeps the last proposal on screen while the card animates away
  const [shown, setShown] = useState<Kans | null>(kans);
  if (kans && kans !== shown) setShown(kans);
  const answered = shown?.status === 'interesse';

  useEffect(() => {
    open.set(kans
      ? reduced
        ? withTiming(1, { duration: 150 })
        : withSpring(1, { damping: 11, stiffness: 150 })
      : withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }));
    if (!kans || reduced) return;
    burst.set(0);
    burst.set(withDelay(180, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) })));
    glow.set(withRepeat(withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1300 })), -1));
    bob.set(withRepeat(withSequence(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) })), -1));
  }, [kans?.id, reduced, open, burst, glow, bob]); // eslint-disable-line react-hooks/exhaustive-deps

  // A second burst when the customer says yes
  useEffect(() => {
    if (!answered || reduced) return;
    burst.set(0);
    burst.set(withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
  }, [answered, reduced, burst]);

  const veil = useAnimatedStyle(() => ({ opacity: Math.min(1, open.value) }));
  const card = useAnimatedStyle(() => ({
    opacity: Math.min(1, open.value * 1.5),
    transform: [{ scale: 0.7 + open.value * 0.3 }, { translateY: (1 - open.value) * 60 }],
  }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 + glow.value * 0.45, transform: [{ scale: 1 + glow.value * 0.18 }] }));
  const float = useAnimatedStyle(() => ({ transform: [{ translateY: -bob.value * 6 }, { rotate: `${(bob.value - 0.5) * 8}deg` }] }));

  if (!shown) return null;
  const k = shown;
  const vanKate = k.afzender === 'kate';
  const paar = k.link.soort === 'koppeling';
  const label = linkLabel({ soort: k.link.soort === 'product' ? 'product' : 'partner', ref: k.link.ref, naam: k.link.naam });
  const kicker = paar ? 'Een slimme samenwerking' : vanKate ? `Kate heeft iets moois voor ${voice.je}` : `Een kans van ${voice.je} adviseur`;
  const spaarpot = vanKate && /save|spaar/i.test(k.link.ref);
  const title = paar ? label.replace(' ↔ ', ' + ') : spaarpot ? `Een spaarpot voor ${voice.je} kleine` : label;
  const why = paar
    ? k.waarom
    : vanKate
      ? [`Omdat ${voice.je} gezin groter wordt`, 'Zo spaart de kleine vanaf dag één mee', `Op basis van wat ${voice.je} zelf met KBC deelde`]
      : k.waarom;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: kans ? 'auto' : 'none' }]} role="dialog" aria-label={`${kicker}: ${title}`} aria-modal>
      <Animated.View style={[StyleSheet.absoluteFill, styles.veil, veil]} />
      <View style={styles.center}>
        <Animated.View style={[styles.card, card]}>
          {/* Sky header with the picture, Kate's logo and the confetti */}
          <View style={styles.header}>
            <View style={[styles.sun]} />
            <View style={[styles.cloud, { left: 18, top: 22 }]} />
            <View style={[styles.cloud, { right: 26, top: 40, width: 46 }]} />
            <Animated.View style={[styles.halo, halo]} />
            <Animated.Text style={[styles.picture, float]} aria-hidden>
              {picture(k)}
            </Animated.Text>
            <View style={styles.logo}>
              <KateLogoIcon size={34} />
            </View>
            {!reduced && CONFETTI.map((c, i) => <Confetti key={i} i={i} color={c} burst={burst} />)}
          </View>

          <View style={styles.body}>
            <Text style={styles.kicker}>{kicker}</Text>
            <Text style={styles.title}>{title}</Text>
            {paar && <Text style={styles.sub}>laten samenwerken voor {voice.je}</Text>}
            {spaarpot && <Text style={styles.sub}>{label} · KBC</Text>}
            {k.bericht && <Text style={styles.note}>“{k.bericht}”</Text>}
            {paar && (
              <Text style={styles.consent}>
                🛡 Hun gegevens stromen pas naar elkaar na {voice.je} ja. {voice.Je} {voice.plural ? 'kunnen' : 'kan'} het altijd weer stoppen.
              </Text>
            )}
            <View style={styles.why}>
              {why.slice(0, 3).map((w) => (
                <View key={w} style={styles.whyRow}>
                  <Text style={styles.whyMark}>✓</Text>
                  <Text style={styles.whyText}>{w}</Text>
                </View>
              ))}
            </View>
            {answered ? (
              <View style={styles.done} aria-live="polite">
                <Text style={styles.doneMark}>✓</Text>
                <Text style={styles.doneText}>{paar ? 'Gekoppeld! Kate regelt de rest.' : 'Top! Kate zet het voor je klaar.'}</Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                <PillButton label={paar ? 'Ja, laat ze samenwerken' : 'Ja, graag!'} onPress={() => onAnswer(k)} style={styles.grow} />
                <PillButton label="Later" variant="link" onPress={onLater} />
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

/** One piece of confetti: flies out from the logo along its own angle, then drifts down and fades. */
function Confetti({ i, color, burst }: { i: number; color: string; burst: SharedValue<number> }) {
  const angle = (i / CONFETTI.length) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
  const dist = 70 + (i % 3) * 22;
  const style = useAnimatedStyle(() => {
    const t = burst.value;
    return {
      opacity: t === 0 ? 0 : 1 - Math.max(0, t - 0.6) / 0.4,
      transform: [
        { translateX: Math.cos(angle) * dist * t },
        { translateY: Math.sin(angle) * dist * t + t * t * 30 },
        { rotate: `${t * (i % 2 ? 260 : -220)}deg` },
      ],
    };
  });
  return <Animated.View style={[styles.confetti, { backgroundColor: color, borderRadius: i % 3 === 0 ? 5 : 2 }, style]} />;
}

const styles = StyleSheet.create({
  veil: { backgroundColor: 'rgba(8,30,60,.5)' },
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: world.card, borderRadius: 30, overflow: 'hidden', boxShadow: shadow.glow },
  header: {
    height: 150,
    backgroundColor: world.skyTop,
    backgroundImage: `linear-gradient(180deg, ${world.skyTop} 0%, ${world.skyBottom} 100%)`,
    alignItems: 'center',
    justifyContent: 'center',
  } as object,
  sun: { position: 'absolute', right: 30, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: world.kateGlow, opacity: 0.9 },
  cloud: { position: 'absolute', width: 60, height: 18, borderRadius: 9, backgroundColor: 'rgba(255,255,255,.85)' },
  halo: { position: 'absolute', width: 118, height: 118, borderRadius: 59, backgroundColor: 'rgba(255,255,255,.75)' },
  picture: { fontSize: 66, lineHeight: 80 },
  logo: {
    position: 'absolute',
    bottom: -17,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.coins,
  },
  confetti: { position: 'absolute', top: 70, left: '50%', width: 9, height: 9 },
  body: { paddingTop: 26, paddingBottom: 18, paddingHorizontal: 20, alignItems: 'center' },
  kicker: { fontFamily: font.body800, fontSize: 11.5, letterSpacing: 0.8, textTransform: 'uppercase', color: world.blue, textAlign: 'center' },
  title: { fontFamily: font.display700, fontSize: 25, lineHeight: 29, color: world.title, textAlign: 'center', marginTop: 4 },
  sub: { fontFamily: font.body700, fontSize: 13, color: world.soft, marginTop: 2, textAlign: 'center' },
  note: {
    fontFamily: font.body600,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    color: world.ink,
    backgroundColor: world.tip,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    alignSelf: 'stretch',
  },
  consent: {
    alignSelf: 'stretch',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#e4f6eb',
    color: '#157a42',
    fontFamily: font.body700,
    fontSize: 12.5,
    lineHeight: 17,
  },
  why: { alignSelf: 'stretch', gap: 6, marginTop: 14, marginBottom: 16 },
  whyRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  whyMark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e4f6eb',
    color: '#157a42',
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 11,
    fontFamily: font.body800,
    overflow: 'hidden',
  },
  whyText: { flex: 1, fontFamily: font.body700, fontSize: 13.5, lineHeight: 18, color: world.ink },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch' },
  grow: { flexGrow: 1 },
  done: { alignItems: 'center', gap: 6, paddingVertical: 4 },
  doneMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: world.good,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 44,
    fontSize: 24,
    fontFamily: font.body800,
    overflow: 'hidden',
  },
  doneText: { fontFamily: font.body800, fontSize: 15.5, color: world.ink },
});
