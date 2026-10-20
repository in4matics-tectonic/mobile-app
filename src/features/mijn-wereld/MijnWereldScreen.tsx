// "Mijn wereld": the customer's world as a street (phase 2). The Kate bar is fixed right above the tab bar;
// everything above it scrolls vertically (project-info.md 4.1): the world, which fills that whole area in
// the first view, then Kate's finding cards and the world in text. The street scrolls horizontally.

import { useFocusEffect } from 'expo-router';
import { StatusBar as SystemStatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { clearSession, getSession } from '@/features/auth/session';
import { useShowcaseCommands } from '@/features/auth/useShowcaseBridge';
import { KateChat } from '@/features/kate-chat/KateChat';
import type { ChatOpener } from '@/features/kate-chat/types';

import { BirthChecklist } from './components/BirthChecklist';
import { BottomSheet } from './components/BottomSheet';
import { Header, StatusBar } from './components/Header';
import { KATE_BAR_HEIGHT, KateBar } from './components/KateBar';
import { KateFindings } from './components/KateFindings';
import { KansPopup } from './components/KansPopup';
import { Veil } from './components/Overlay';
import { PhoneFrame, usePhoneFramed } from './components/PhoneFrame';
import { AccountSheet, WhySheet } from './components/SheetContent';
import { TabBar } from './components/TabBar';
import { PillButton } from './components/ui';
import { ConnectSheet, ConsentSheet, PartnersSheet, PlaceSheet, PlotSheet } from './components/WorldSheets';
import { WorldText, type TextLink } from './components/WorldText';
import { openCount } from './state/reducer';
import { useMijnWereld, useMijnWereldCommands } from './state/store';
import { PARTNER_PLACEMENT } from './world/categories';
import { householdVoice, selectFindings, selectTextGroups } from './world/state/selectors';
import { useWorld, useWorldCommands } from './world/state/store';
import { useKateTicker } from './world/state/useKateTicker';
import Street, { type StreetHandle } from './world/Street';
import type { CategoryId, Finding, FindingCommand } from './world/types';
import { font, page, world } from './theme';

type Sheet =
  | { kind: 'place'; placeId: CategoryId; partnerId?: string }
  | { kind: 'why' }
  | { kind: 'checklist' }
  | { kind: 'account' }
  | { kind: 'consent' }
  | { kind: 'partners' };

/** The Kate bar with its margins. */
const BAR_BAND = KATE_BAR_HEIGHT + 20;
/** The world fills the scroll area, but stays drawable in a short landscape window. */
const WORLD_MIN = 320;

export default function MijnWereldScreen() {
  const scheme = useColorScheme();
  const colors = page[scheme === 'dark' ? 'dark' : 'light'];
  const framed = usePhoneFramed();

  return (
    <PhoneFrame background={colors.bg}>
      <PhoneScreen framed={framed} />
    </PhoneFrame>
  );
}

function PhoneScreen({ framed }: { framed: boolean }) {
  const moment = useMijnWereld();
  const momentCommands = useMijnWereldCommands();
  const { state, built } = useWorld();
  const commands = useWorldCommands();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const reduced = useReducedMotion();
  const native = Platform.OS !== 'web';
  const topInset = native ? insets.top : 0;

  // ---- Sizes ----

  // The world band is exactly the scroll area's height: everything between the top and the Kate bar.
  // Until the scroll area is measured, it's estimated from the screen.
  const [screen, setScreen] = useState({ width: windowWidth, height: windowHeight });
  const [tabHeight, setTabHeight] = useState(84);
  const [viewport, setViewport] = useState<number | null>(null);
  const bandHeight = Math.max(WORLD_MIN, Math.round(viewport ?? screen.height - tabHeight - BAR_BAND));

  // ---- Fly-in on every focus (D7), and again on a tap on the "Mijn wereld" tab ----

  const [flyInKey, setFlyInKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFlyInKey((k) => k + 1);
    }, []),
  );
  const street = useRef<StreetHandle>(null);
  const pageScroll = useRef<ScrollView>(null);
  /** Back to the top first, so the replay is in view even when the finding cards were scrolled up. */
  const replayFlyIn = () => {
    pageScroll.current?.scrollTo({ y: 0, animated: false });
    setFlyInKey((k) => k + 1);
  };

  // ---- Sheets and chat ----

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [lastSheet, setLastSheet] = useState<Sheet | null>(null);
  const [chat, setChat] = useState<{ open: boolean; opener: ChatOpener | null }>({ open: false, opener: null });
  const openSheet = (next: Sheet) => {
    setSheet(next);
    setLastSheet(next);
  };
  const closeSheet = useCallback(() => setSheet(null), []);
  const closeChat = useCallback(() => setChat((c) => ({ ...c, open: false })), []);
  // From a sheet ("Vraag Kate"), the chat rises over it and the sheet stays put; once the chat covers it,
  // KateChat's onOpened closes the sheet unseen (closeSheet). One motion, one veil, no glitch.
  const openChat = (opener: ChatOpener | null) => setChat({ open: true, opener });

  // ---- Kate ----

  const checklist = moment.checklist
    ? { ready: moment.checklist.ready.length, open: openCount(moment) }
    : null;
  const findings = useMemo(
    () =>
      selectFindings({
        built,
        phase: moment.phase,
        checklist,
        kansen: state.data?.kansen,
        arrived: state.arrived,
        dismissed: state.dismissed,
      }),
    // checklist is derived from moment.checklist and the todo states
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [built, moment.phase, moment.checklist, moment.runs, state.data?.kansen, state.arrived, state.dismissed],
  );
  const [held, setHeld] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => sub.remove();
  }, []);
  const ticker = useKateTicker(findings.bar, { paused: held || chat.open || screenReader, reduced });
  const voice = householdVoice(built);

  const openerOf = (f: Finding | undefined): ChatOpener | null => (f?.opener ? { findingId: f.id, text: f.opener } : null);

  // Koppel / Stop delen. After a connect, the sheet closes and the street shows the place.
  const deling = async (partner: string, deelt: boolean) => {
    const ok = await commands.setDeling(partner, deelt);
    if (ok && deelt) {
      closeSheet();
      const target = PARTNER_PLACEMENT[partner]?.category;
      if (target) setTimeout(() => street.current?.scrollToPlace(target), 50);
    }
    return ok;
  };

  const onCommand = (f: Finding, command: FindingCommand) => {
    switch (command) {
      case 'ask-kate':
        return openChat(openerOf(f));
      case 'view':
        if (f.placeId) {
          street.current?.scrollToPlace(f.placeId);
          openSheet({ kind: 'place', placeId: f.placeId });
        }
        return;
      case 'connect':
        if (f.link) deling(f.link.ref, true);
        return;
      case 'confirm':
        return momentCommands.confirm();
      case 'reject':
        return momentCommands.reject();
      case 'why':
        return openSheet({ kind: 'why' });
      case 'checklist':
        return openSheet({ kind: 'checklist' });
      case 'dismiss':
        return commands.dismissFinding(f.id);
      case 'kans-interesse':
      case 'kans-afwijzen':
        if (f.kansId) commands.answerKans(f.kansId, command === 'kans-interesse' ? 'interesse' : 'afgewezen');
        return;
    }
  };

  // ---- A proposal that comes in pops up, oldest first, once nothing else is open ----

  const kansen = useMemo(() => state.data?.kansen ?? [], [state.data?.kansen]);
  const [popId, setPopId] = useState<string | null>(null);
  const [later, setLater] = useState<string[]>([]);
  const popKans = popId ? (kansen.find((k) => k.id === popId) ?? null) : null;
  const busy = !!sheet || chat.open;
  const next = popId || busy ? undefined : [...kansen].reverse().find((k) => k.status === 'nieuw' && !later.includes(k.id));
  if (next) setPopId(next.id);
  useEffect(() => {
    if (popId) commands.seenKans(popId);
  }, [popId, commands]);
  // Answered (here, in a finding card, or by the tour): show the confirmation a moment, then close
  const answered = popKans?.status === 'interesse' || popKans?.status === 'afgewezen' || (popId !== null && !popKans);
  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(() => setPopId(null), 1700);
    return () => clearTimeout(t);
  }, [answered]);

  // The PoC showcase's pitch tour presses the same buttons a customer would (web, in the showcase's iframe only)
  useShowcaseCommands((c) => {
    if (c.kateStudio === 'moment' && c.answer === 'confirm' && moment.phase === 'ask') momentCommands.confirm();
    if (c.kateStudio === 'checklist' && c.open === true) openSheet({ kind: 'checklist' });
    if (c.kateStudio === 'checklist' && c.open === false && sheet?.kind === 'checklist') closeSheet();
    if (c.kateStudio === 'checklist' && c.run === 'all' && moment.checklist) {
      openSheet({ kind: 'checklist' });
      momentCommands.runAll();
    }
    if (c.kateStudio === 'kans') {
      const open = (k: { status: string }) => k.status === 'nieuw' || k.status === 'gezien';
      const kans = popKans && open(popKans) ? popKans : [...kansen].reverse().find(open);
      if (kans) commands.answerKans(kans.id, c.answer === 'afgewezen' ? 'afgewezen' : 'interesse');
    }
  });

  const onTextLink = (link: TextLink) => {
    if (link === 'logout') return clearSession();
    openSheet({ kind: link });
  };

  // ---- Render ----

  const shown = sheet ?? lastSheet;
  const displayName = (state.data?.profiel.naam ?? moment.customer?.displayName ?? '').replace(/\s+en\s+/i, ' & ');
  const confirmed = moment.phase === 'confirmed' || moment.phase === 'done';

  return (
    <View style={styles.screen} onLayout={(e) => setScreen(e.nativeEvent.layout)}>
      {native && <SystemStatusBar style="dark" />}
      <ScrollView
        ref={pageScroll}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onLayout={(e) => setViewport(e.nativeEvent.layout.height)}
        showsVerticalScrollIndicator={false}>
        {/* 1 · World */}
        <View style={{ height: bandHeight }}>
          <Street
            ref={street}
            world={built?.view ?? null}
            height={bandHeight}
            flyInKey={flyInKey}
            reducedMotion={reduced}
            onSelectPlace={async (id) => openSheet({ kind: 'place', placeId: id as CategoryId })}
            onSelectAttachment={async (placeId, partnerId) => {
              const place = built?.view.places.find((p) => p.id === placeId);
              const attachment = place?.attachments.find((a) => a.partnerId === partnerId);
              openSheet({ kind: 'place', placeId: placeId as CategoryId, partnerId: attachment?.state === 'ghost' ? partnerId : undefined });
            }}
            onFlyInDone={async () => {}}
            onArrivalsDone={async (ids) => commands.markArrivalsSeen(ids as CategoryId[])}
            onZoneChange={async () => {}}
            dom={{ scrollEnabled: false, style: { width: native ? screen.width : '100%', height: bandHeight, backgroundColor: 'transparent' } }}
          />
          <View style={[styles.header, { paddingTop: topInset }]}>
            {framed && <StatusBar />}
            <Header displayName={displayName} coins={moment.coins} />
          </View>
          {state.status === 'error' && (
            <View style={styles.error} role="alert">
              <Text style={styles.errorText}>Kate kan {voice.je} wereld nu niet laden.</Text>
              <PillButton label="Opnieuw proberen" onPress={commands.reload} />
            </View>
          )}
        </View>

        {/* 2 · Finding cards, 3 · the world in text */}
        <View style={styles.body}>
          {state.status === 'loading' ? (
            <ActivityIndicator color={world.blue} style={styles.loading} />
          ) : (
            <>
              <KateFindings findings={findings.cards} je={voice.je} deling={state.deling} onCommand={onCommand} />
              <WorldText
                groups={selectTextGroups(built)}
                onOpenPlace={(id) => {
                  street.current?.scrollToPlace(id);
                  openSheet({ kind: 'place', placeId: id });
                }}
                onLink={onTextLink}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Kate bar, always right above the tab bar */}
      <View style={styles.barBand}>
        <KateBar ticker={ticker} reduced={reduced} onPress={() => openChat(openerOf(ticker.current))} onHold={setHeld} />
      </View>

      <View onLayout={(e) => setTabHeight(e.nativeEvent.layout.height)}>
        <TabBar
          bottomInset={native ? insets.bottom : 0}
          actions={{ 'Mijn wereld': replayFlyIn, Kate: () => openChat(null), Meer: () => openSheet({ kind: 'account' }) }}
        />
      </View>

      {/* Overlays: one veil under both; the chat stacks over a sheet */}
      <Veil visible={!!sheet || chat.open} onPress={chat.open ? closeChat : closeSheet} />
      <BottomSheet open={!!sheet} covered={chat.open} label={sheetLabel(shown, built?.view.places)} onClose={closeSheet}>
        {shown?.kind === 'place' && state.data && built && (
          <PlaceSheets
            sheet={shown}
            data={state.data}
            built={built}
            voice={voice}
            deling={state.deling}
            onDeling={deling}
            onAskKate={openChat}
            onChecklist={confirmed && moment.checklist ? () => openSheet({ kind: 'checklist' }) : undefined}
            onClose={closeSheet}
          />
        )}
        {shown?.kind === 'why' && (
          <WhySheet
            signals={moment.moment.signals}
            hiddenSignals={moment.moment.hiddenSignals}
            canAnswer={moment.phase === 'ask'}
            onConfirm={() => {
              closeSheet();
              momentCommands.confirm();
            }}
            onReject={() => {
              closeSheet();
              momentCommands.reject();
            }}
          />
        )}
        {shown?.kind === 'consent' && state.data && (
          <ConsentSheet toestemming={state.data.profiel.toestemming} onChange={commands.setConsent} onClose={closeSheet} />
        )}
        {shown?.kind === 'partners' && state.data && (
          <PartnersSheet data={state.data} voice={voice} deling={state.deling} onDeling={deling} onClose={closeSheet} />
        )}
        {shown?.kind === 'account' && (
          <AccountSheet
            displayName={displayName}
            username={getSession()?.user.sub}
            onLogout={() => {
              closeSheet();
              clearSession();
            }}
            onClose={closeSheet}
          />
        )}
        {shown?.kind === 'checklist' &&
          (moment.checklist ? (
            <BirthChecklist
              ready={moment.checklist.ready}
              todo={moment.checklist.todo}
              runs={moment.runs}
              onRun={momentCommands.runTodo}
              onRunAll={momentCommands.runAll}
              onClose={closeSheet}
            />
          ) : (
            <ActivityIndicator color={world.blue} style={styles.loading} />
          ))}
      </BottomSheet>

      <KansPopup
        kans={popKans}
        voice={voice}
        reduced={reduced}
        onAnswer={(k) => commands.answerKans(k.id, 'interesse')}
        onLater={() => {
          if (popId) setLater((l) => [...l, popId]);
          setPopId(null);
        }}
      />

      <KateChat
        open={chat.open}
        opener={chat.opener}
        onClose={closeChat}
        onOpened={closeSheet}
        // Create the chat view while a sheet is open or the Kate bar is pressed, not while the panel slides in.
        prewarm={!!sheet || held}
        topInset={topInset}
      />
    </View>
  );
}

/** A place's sheet follows its live state: linked, ghost (or a ghost attachment) or plot. */
function PlaceSheets({
  sheet,
  onChecklist,
  ...common
}: Omit<ComponentProps<typeof PlaceSheet>, 'place' | 'onChecklist'> & {
  sheet: Extract<Sheet, { kind: 'place' }>;
  onChecklist?: () => void;
}) {
  const place = common.built.view.places.find((p) => p.id === sheet.placeId);
  if (!place) return <Text style={styles.gone}>Deze plek is niet meer in {common.voice.je} wereld.</Text>;
  if (place.state === 'plot') return <PlotSheet place={place} {...common} />;
  if (place.state === 'ghost' || sheet.partnerId) return <ConnectSheet place={place} partnerId={sheet.partnerId} {...common} />;
  return <PlaceSheet place={place} onChecklist={place.id === 'household' ? onChecklist : undefined} {...common} />;
}

function sheetLabel(sheet: Sheet | null, places: { id: CategoryId; label: string }[] | undefined) {
  if (!sheet) return '';
  switch (sheet.kind) {
    case 'why':
      return 'Waarom vraag ik dit?';
    case 'checklist':
      return 'Klaar voor de geboorte';
    case 'account':
      return 'Account';
    case 'consent':
      return 'Op jouw maat';
    case 'partners':
      return 'Gekoppelde partners';
    case 'place':
      return places?.find((p) => p.id === sheet.placeId)?.label ?? 'Plek';
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: world.ground, overflow: 'hidden' },
  scroll: { flex: 1 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'box-none' },
  content: { paddingBottom: 16 },
  barBand: { height: BAR_BAND, justifyContent: 'center', backgroundColor: world.ground },
  body: { gap: 12, paddingTop: 16, paddingHorizontal: 16 },
  loading: { marginTop: 24 },
  error: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '42%',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.92)',
  },
  errorText: { fontFamily: font.body700, fontSize: 14, color: world.ink, textAlign: 'center' },
  gone: { fontFamily: font.body600, fontSize: 14, color: world.soft, marginBottom: 16 },
});
