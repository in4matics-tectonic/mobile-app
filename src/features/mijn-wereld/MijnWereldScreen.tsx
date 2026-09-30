// "Mijn wereld": the customer's life as a floating island. Reads the shared store and
// hands each child the slice it needs.

import { StatusBar as SystemStatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutRectangle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { clearSession, getSession } from '@/features/auth/session';

import { BirthChecklist } from './components/BirthChecklist';
import { BottomSheet } from './components/BottomSheet';
import { DomainTiles } from './components/DomainTiles';
import { Header, StatusBar } from './components/Header';
import IslandScene from './components/IslandScene';
import { KateCard } from './components/KateCard';
import { PhoneFrame, usePhoneFramed } from './components/PhoneFrame';
import { AccountSheet, DomainSheet, WhySheet } from './components/SheetContent';
import { SkyBackground } from './components/SkyBackground';
import { TabBar } from './components/TabBar';
import { PillButton } from './components/ui';
import { openCount } from './state/reducer';
import { familyView, selectTiles } from './state/selectors';
import { useMijnWereld, useMijnWereldCommands } from './state/store';
import type { Domain } from './state/types';
import { font, page, world } from './theme';

type Sheet =
  | { kind: 'domain'; domain: Domain }
  | { kind: 'why' }
  | { kind: 'checklist' }
  | { kind: 'account' };

/** Where the sky ends inside the island, as in the prototype (42% of 812px). */
const SKY_STOP_IN_SCENE = 0.836;

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
  const state = useMijnWereld();
  const commands = useMijnWereldCommands();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [scene, setScene] = useState<LayoutRectangle | null>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [lastSheet, setLastSheet] = useState<Sheet | null>(null);

  const native = Platform.OS !== 'web';
  const topInset = native ? insets.top : 0;

  const openSheet = (next: Sheet) => {
    setSheet(next);
    setLastSheet(next);
  };
  const closeSheet = useCallback(() => setSheet(null), []);

  const confirm = () => {
    closeSheet();
    commands.confirm();
  };
  const reject = () => {
    closeSheet();
    commands.reject();
  };

  const selectDomain = async (domain: Domain) => openSheet({ kind: 'domain', domain });

  const { customer, phase } = state;
  const family = familyView(phase, customer?.displayName ?? '');
  const verified = Object.fromEntries(state.domains.map((d) => [d.id, d.verified]));
  const sceneWidth = scene?.width ?? Math.min(windowWidth, 366);
  const skyHeight = scene ? scene.y + scene.height * SKY_STOP_IN_SCENE : 341;
  const shown = sheet ?? lastSheet;

  return (
    <View style={styles.screen}>
      {native && <SystemStatusBar style="dark" />}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: topInset }]}
        showsVerticalScrollIndicator={false}>
        <SkyBackground height={skyHeight} />
        {framed && <StatusBar />}
        <Header
          displayName={customer?.displayName ?? ''}
          coins={state.coins}
        />

        <View style={styles.scene} onLayout={(e) => setScene(e.nativeEvent.layout)}>
          <IslandScene
            phase={phase}
            familyLabel={family.islandLabel}
            verified={verified}
            onSelectDomain={selectDomain}
            dom={{
              scrollEnabled: false,
              style: { width: sceneWidth, height: (sceneWidth * 300) / 360, backgroundColor: 'transparent' },
            }}
          />
        </View>

        <View style={styles.body}>
          {state.status === 'loading' && <ActivityIndicator color={world.blue} style={styles.loading} />}
          {state.status === 'error' && (
            <View style={styles.error} role="alert">
              <Text style={styles.errorText}>Kate kan jullie wereld nu niet laden.</Text>
              <PillButton label="Opnieuw proberen" onPress={commands.reload} />
            </View>
          )}
          {state.status === 'ready' && customer && (
            <>
              <KateCard
                phase={phase}
                consents={customer.consents}
                readyCount={state.checklist?.ready.length ?? 0}
                openCount={openCount(state)}
                checklistLoaded={!!state.checklist}
                onConfirm={confirm}
                onReject={reject}
                onWhy={() => openSheet({ kind: 'why' })}
                onShowChecklist={() => openSheet({ kind: 'checklist' })}
              />
              <DomainTiles
                tiles={selectTiles(state)}
                onOpen={(domain) => openSheet({ kind: 'domain', domain })}
              />
            </>
          )}
        </View>
      </ScrollView>

      <TabBar bottomInset={native ? insets.bottom : 0} onMore={() => openSheet({ kind: 'account' })} />

      <BottomSheet open={!!sheet} label={sheetLabel(shown)} onClose={closeSheet}>
        {shown?.kind === 'domain' && (
          <DomainSheet
            domain={state.domains.find((d) => d.id === shown.domain) ?? state.domains[0]}
            onClose={closeSheet}
          />
        )}
        {shown?.kind === 'why' && (
          <WhySheet
            signals={state.moment.signals}
            hiddenSignals={state.moment.hiddenSignals}
            canAnswer={phase === 'ask'}
            onConfirm={confirm}
            onReject={reject}
          />
        )}
        {shown?.kind === 'account' && (
          <AccountSheet
            displayName={customer?.displayName ?? ''}
            username={getSession()?.user.sub}
            onLogout={() => {
              closeSheet();
              clearSession();
            }}
            onClose={closeSheet}
          />
        )}
        {shown?.kind === 'checklist' &&
          (state.checklist ? (
            <BirthChecklist
              ready={state.checklist.ready}
              todo={state.checklist.todo}
              runs={state.runs}
              onRun={commands.runTodo}
              onRunAll={commands.runAll}
              onClose={closeSheet}
            />
          ) : (
            <ActivityIndicator color={world.blue} style={styles.loading} />
          ))}
      </BottomSheet>
    </View>
  );
}

function sheetLabel(sheet: Sheet | null) {
  if (!sheet) return '';
  if (sheet.kind === 'why') return 'Waarom vraag ik dit?';
  if (sheet.kind === 'checklist') return 'Klaar voor de geboorte';
  if (sheet.kind === 'account') return 'Account';
  return `Details ${sheet.domain}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: world.ground, overflow: 'hidden' },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 16 },
  scene: { marginTop: -4 },
  body: { gap: 12, paddingHorizontal: 16, marginTop: -8 },
  loading: { marginTop: 24 },
  error: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  errorText: { fontFamily: font.body700, fontSize: 14, color: world.ink },
});
