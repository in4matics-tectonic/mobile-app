// Sheets for the world (4.11): a linked place (PlaceSheet), a ghost (ConnectSheet), a plot (PlotSheet),
// plus "Op jouw maat" (ConsentSheet) and "Gekoppelde partners" (PartnersSheet) from the text section.
// Koppel and Stop delen are PUT K/partners/:partner {deelt}; only the customer can do them.

import { useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';

import type { Bron, KlantPartner, Link } from '../services/kbcApi';
import type { WorldData } from '../services/worldService';
import type { BuiltWorld } from '../world/buildWorld';
import { PARTNER_PLACEMENT, SENSITIVE_PARTNERS, TIP_MIN } from '../world/categories';
import { capitalize, herkomstShort, herkomstText, linkLabel, sinceText, type Voice } from '../world/labels';
import { brandColors } from '../world/partners';
import type { DelingStatus } from '../world/state/reducer';
import { tipFinding } from '../world/state/selectors';
import type { Place } from '../world/types';
import { font, world } from '../theme';
import { SheetTitle, sheetStyles } from './SheetContent';
import { Chip, PillButton } from './ui';

export interface Opener {
  findingId: string;
  text: string;
}

interface Common {
  data: WorldData;
  built: BuiltWorld;
  voice: Voice;
  deling: Record<string, DelingStatus>;
  /** Resolves true when the backend accepted it. */
  onDeling: (partner: string, deelt: boolean) => Promise<boolean>;
  onAskKate: (opener: Opener) => void;
  onClose: () => void;
}

// ---- Shared rows ----

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BrandDot({ partnerId }: { partnerId: string }) {
  const c = brandColors(partnerId);
  return <View style={[styles.dot, { backgroundColor: c.primary, borderColor: c.secondary ?? c.primary }]} />;
}

function PartnerRow({
  partnerId,
  naam,
  sub,
  action,
  status,
  onPress,
}: {
  partnerId: string;
  naam: string;
  sub?: string;
  action: 'Koppel' | 'Stop delen';
  status?: DelingStatus;
  onPress: () => void;
}) {
  const busy = status === 'connecting';
  return (
    <View style={styles.rowWrap}>
      <View style={styles.row}>
        <BrandDot partnerId={partnerId} />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{naam}</Text>
          {!!sub && <Text style={styles.rowSub}>{sub}</Text>}
        </View>
        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={world.blue} size="small" />
            <Text style={styles.busyText}>{action === 'Koppel' ? 'Koppelen…' : 'Stoppen…'}</Text>
          </View>
        ) : (
          <PillButton small label={action} variant={action === 'Koppel' ? 'primary' : 'secondary'} onPress={onPress} />
        )}
      </View>
      {status === 'failed' && (
        <Text style={styles.error} role="alert">
          {action === 'Koppel' ? 'Koppelen lukte niet. Probeer opnieuw.' : 'Stoppen lukte niet. Probeer opnieuw.'}
        </Text>
      )}
    </View>
  );
}

function ProductRow({ link, shield }: { link: Link; shield: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, styles.kbcDot]} />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{linkLabel(link)}</Text>
        <Text style={styles.rowSub}>{shield ? 'KBC · beschermt deze plek' : 'KBC'}</Text>
      </View>
      <Chip tone="ok">actief</Chip>
    </View>
  );
}

function TipList({ tips, place, ...common }: Common & { tips: Link[]; place: Place }) {
  if (!tips.length) return null;
  return (
    <Section title="Kate denkt aan">
      {tips.map((tip) => {
        const finding = tipFinding(tip, place.id, common.voice);
        const partner = tip.soort === 'partner';
        return (
          <View key={tip.id} style={styles.tip}>
            <Text style={styles.rowTitle}>{partner ? tip.naam : linkLabel(tip)}</Text>
            {(tip.waarom ?? []).map((w) => (
              <Text key={w.via} style={styles.reason}>
                · {w.reden}
              </Text>
            ))}
            <View style={styles.actions}>
              <PillButton small label="Vraag Kate" variant={partner ? 'secondary' : 'primary'} onPress={() => common.onAskKate({ findingId: finding.id, text: finding.opener! })} />
              {partner &&
                (common.deling[tip.ref] === 'connecting' ? (
                  <View style={styles.busy}>
                    <ActivityIndicator color={world.blue} size="small" />
                    <Text style={styles.busyText}>Koppelen…</Text>
                  </View>
                ) : (
                  <PillButton small label="Koppel" onPress={() => common.onDeling(tip.ref, true)} />
                ))}
            </View>
            {partner && common.deling[tip.ref] === 'failed' && (
              <Text style={styles.error} role="alert">
                Koppelen lukte niet. Probeer opnieuw.
              </Text>
            )}
          </View>
        );
      })}
    </Section>
  );
}

const relationOf = (data: WorldData, partnerId: string): KlantPartner | undefined =>
  data.partners.find((p) => p.partner === partnerId);

const clusterNames = (built: BuiltWorld, place: Place) =>
  place.ecosystems.map((e) => built.clusters.find((c) => c.ecosysteem === e)?.naam).filter(Boolean).join(' · ');

const brandTitle = (place: Place) => {
  const names = place.brands.filter((b) => b.partnerId !== 'kbc').map((b) => b.name);
  return names.length ? `${place.label} · ${names.join(', ')}` : place.label;
};

// ---- Linked place ----

export function PlaceSheet({ place, onChecklist, ...common }: Common & { place: Place; onChecklist?: () => void }) {
  const { data, built, voice, deling, onDeling, onClose } = common;
  const actief = place.links.filter((l) => l.status === 'actief');
  const gekend = place.links.filter((l) => l.status === 'gekend' && l.soort === 'partner');
  const tips = place.tips.filter((t) => (t.score ?? 0) >= TIP_MIN).slice(0, 4);
  const subtitle =
    place.id === 'household' ? built.view.household.names.join(' en ') : clusterNames(built, place) || 'In je wereld';
  return (
    <>
      <SheetTitle title={brandTitle(place)} subtitle={subtitle} />
      {actief.length > 0 && (
        <Section title={`In ${voice.je} wereld`}>
          {actief.map((l) => {
            if (l.soort === 'product') return <ProductRow key={l.id} link={l} shield={place.shields.includes(l.ref)} />;
            const rel = relationOf(data, l.ref);
            const sub = [rel?.sinds && `sinds ${sinceText(rel.sinds)}`, herkomstShort(rel?.herkomst ?? l.herkomst, voice)].filter(Boolean).join(' · ');
            return (
              <PartnerRow
                key={l.id}
                partnerId={l.ref}
                naam={l.naam}
                sub={sub}
                action="Stop delen"
                status={deling[l.ref]}
                onPress={() => onDeling(l.ref, false)}
              />
            );
          })}
        </Section>
      )}
      {gekend.length > 0 && (
        <Section title="Nog te koppelen">
          {gekend.map((l) => (
            <PartnerRow
              key={l.id}
              partnerId={l.ref}
              naam={l.naam}
              sub={herkomstText(l.herkomst, l.naam, voice)}
              action="Koppel"
              status={deling[l.ref]}
              onPress={() => onDeling(l.ref, true)}
            />
          ))}
        </Section>
      )}
      <TipList tips={tips} place={place} {...common} />
      <View style={styles.footer}>
        {onChecklist && <PillButton label="Bekijk checklist" onPress={onChecklist} />}
        <PillButton label="Sluiten" variant="secondary" onPress={onClose} />
      </View>
    </>
  );
}

// ---- Ghost ----

export function ConnectSheet({ place, partnerId, ...common }: Common & { place: Place; partnerId?: string }) {
  const { data, voice, deling, onDeling, onClose } = common;
  const known = place.links.filter((l) => l.soort === 'partner' && l.status === 'gekend' && (!partnerId || l.ref === partnerId));
  // An empty essential: every catalogue partner that would land here.
  const candidates = known.length
    ? []
    : data.catalogus.partners.filter(
        (p) => PARTNER_PLACEMENT[p.id]?.category === place.id && !p.gevoelig && !SENSITIVE_PARTNERS.has(p.id),
      );
  const names = known.length ? known.map((l) => l.naam) : candidates.map((p) => p.naam);
  const title = known.length === 1 ? `Koppel ${known[0].naam}` : known.length ? `Koppel ${voice.je} partners` : `Koppel ${voice.je} ${place.label.toLowerCase()}`;
  const tips = place.tips.filter((t) => (t.score ?? 0) >= TIP_MIN).slice(0, 3);
  return (
    <>
      <SheetTitle title={title} subtitle={`Nog niet gekoppeld · ${place.label}`} />
      <Section title={known.length ? 'Kate zag' : 'Kies een partner'}>
        {known.map((l) => (
          <PartnerRow
            key={l.id}
            partnerId={l.ref}
            naam={l.naam}
            sub={herkomstText(l.herkomst, l.naam, voice)}
            action="Koppel"
            status={deling[l.ref]}
            onPress={() => onDeling(l.ref, true)}
          />
        ))}
        {candidates.map((p) => (
          <PartnerRow key={p.id} partnerId={p.id} naam={p.naam} action="Koppel" status={deling[p.id]} onPress={() => onDeling(p.id, true)} />
        ))}
      </Section>
      {names.length > 0 && (
        <Text style={sheetStyles.tip}>
          {names.length === 1 ? names[0] : 'De partner'} deelt dan {voice.je} gegevens met KBC. {voice.Je}{' '}
          {voice.plural ? 'kunnen' : 'kan'} dit altijd stoppen.
        </Text>
      )}
      {!partnerId && <TipList tips={tips} place={place} {...common} />}
      <View style={styles.footer}>
        <PillButton label="Sluiten" variant="secondary" onPress={onClose} />
      </View>
    </>
  );
}

// ---- Plot ----

export function PlotSheet({ place, ...common }: Common & { place: Place }) {
  const name = (place.plotName ?? place.label).split(' · ')[0];
  return (
    <>
      <SheetTitle title={`${capitalize(name)}: hier kan ${common.voice.je} wereld groeien`} subtitle="Kate ziet hier kansen, op basis van wat er al in je wereld staat." />
      <TipList tips={place.tips} place={place} {...common} />
      <View style={styles.footer}>
        <PillButton label="Sluiten" variant="secondary" onPress={common.onClose} />
      </View>
    </>
  );
}

// ---- Op jouw maat ----

const CONSENTS: { bron: Bron; title: string; sub: string }[] = [
  { bron: 'REKENING', title: 'Betalingen op je rekening', sub: 'Zo ziet KBC welke partners je gebruikt.' },
  { bron: 'APP', title: 'Gebruik van KBC Mobile', sub: 'Diensten van partners die je in de app gebruikt.' },
  { bron: 'DOCCLE', title: 'Doccle', sub: 'Enkel afzender, type en datum van documenten.' },
  { bron: 'GEOFENCE', title: 'Locatie', sub: 'Plaatsen die je bezoekt, zonder exacte route.' },
  { bron: 'EIGEN_AI', title: 'Je eigen AI-assistent', sub: 'Wat je eigen assistent met KBC deelt.' },
];

export function ConsentSheet({
  toestemming,
  onChange,
  onClose,
}: {
  toestemming: Record<Bron, boolean>;
  onChange: (bron: Bron, value: boolean) => Promise<boolean>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState<Bron | null>(null);
  const [failed, setFailed] = useState(false);
  return (
    <>
      <SheetTitle title="Op jouw maat" subtitle="Jij kiest welke gegevens Kate mag gebruiken. Zet je iets uit, dan verdwijnt wat KBC enkel zo wist." />
      {CONSENTS.map((c) => (
        <View key={c.bron} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{c.title}</Text>
            <Text style={styles.rowSub}>{c.sub}</Text>
          </View>
          <Switch
            aria-label={c.title}
            value={toestemming[c.bron]}
            disabled={busy !== null}
            trackColor={{ true: world.blue, false: '#cfd9e5' }}
            onValueChange={async (value) => {
              setBusy(c.bron);
              setFailed(!(await onChange(c.bron, value)));
              setBusy(null);
            }}
          />
        </View>
      ))}
      {failed && (
        <Text style={styles.error} role="alert">
          Dat lukte niet. Probeer opnieuw.
        </Text>
      )}
      <View style={styles.footer}>
        <PillButton label="Klaar" onPress={onClose} />
      </View>
    </>
  );
}

// ---- Gekoppelde partners ----

export function PartnersSheet({ data, voice, deling, onDeling, onClose }: Omit<Common, 'built' | 'onAskKate'>) {
  const visible = data.partners.filter((p) => p.klantBijPartner && !p.gevoelig && !SENSITIVE_PARTNERS.has(p.partner));
  const sharing = visible.filter((p) => p.deelt);
  const known = visible.filter((p) => !p.deelt);
  return (
    <>
      <SheetTitle title="Gekoppelde partners" subtitle="Partners die gegevens met KBC delen. Stoppen kan altijd, met één tik." />
      <Section title="Delen met KBC">
        {sharing.length ? (
          sharing.map((p) => (
            <PartnerRow
              key={p.partner}
              partnerId={p.partner}
              naam={p.naam}
              sub={[p.sinds && `sinds ${sinceText(p.sinds)}`, herkomstShort(p.herkomst, voice)].filter(Boolean).join(' · ')}
              action="Stop delen"
              status={deling[p.partner]}
              onPress={() => onDeling(p.partner, false)}
            />
          ))
        ) : (
          <Text style={styles.rowSub}>Nog geen partners.</Text>
        )}
      </Section>
      {known.length > 0 && (
        <Section title="KBC kent ze, maar ze delen niets">
          {known.map((p) => (
            <PartnerRow
              key={p.partner}
              partnerId={p.partner}
              naam={p.naam}
              sub={herkomstText(p.herkomst, p.naam, voice)}
              action="Koppel"
              status={deling[p.partner]}
              onPress={() => onDeling(p.partner, true)}
            />
          ))}
        </Section>
      )}
      <View style={styles.footer}>
        <PillButton label="Sluiten" variant="secondary" onPress={onClose} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 14, gap: 8 },
  sectionTitle: { fontFamily: font.body800, fontSize: 12, color: world.blue, letterSpacing: 0.48, textTransform: 'uppercase' },
  rowWrap: { gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: world.line,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: font.body800, fontSize: 14, color: world.ink },
  rowSub: { fontFamily: font.body600, fontSize: 12.5, color: world.soft, marginTop: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3 },
  kbcDot: { backgroundColor: '#0d2a50', borderColor: '#0097db' },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 6 },
  busyText: { fontFamily: font.body700, fontSize: 12.5, color: world.blue },
  error: { fontFamily: font.body700, fontSize: 12.5, color: '#b3261e' },
  tip: { backgroundColor: world.tip, borderRadius: 16, padding: 12, gap: 3 },
  reason: { fontFamily: font.body600, fontSize: 12.5, lineHeight: 17, color: world.soft },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
});
