// "Klaar voor de geboorte": what is already fine, and what Kate can arrange per item (STP).

import { StyleSheet, Text, View } from 'react-native';

import type { ReadyItem, TodoId, TodoItem, TodoRun } from '../state/types';
import { font, world } from '../theme';
import { SheetTitle } from './SheetContent';
import { PillButton } from './ui';

export function BirthChecklist({
  ready,
  todo,
  runs,
  onRun,
  onRunAll,
  onClose,
}: {
  ready: ReadyItem[];
  todo: TodoItem[];
  runs: Partial<Record<TodoId, TodoRun>>;
  onRun: (id: TodoId) => void;
  onRunAll: () => void;
  onClose: () => void;
}) {
  const doneCount = todo.filter((t) => t.status === 'done').length;
  const allDone = doneCount === todo.length;

  return (
    <>
      <SheetTitle title="Klaar voor de geboorte" subtitle="Op basis van wat jullie al hebben bij KBC." />

      <Text style={[styles.group, styles.groupOk]}>Al in orde</Text>
      <View style={styles.list}>
        {ready.map((item) => (
          <View key={item.title} style={[styles.item, styles.itemOk]}>
            <Dot ok />
            <View style={styles.text}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.groupRow}>
        <Text style={[styles.group, styles.groupTodo]}>Nog te regelen</Text>
        <Text style={styles.count} aria-live="polite">
          {doneCount}/{todo.length} geregeld
        </Text>
      </View>
      <View style={styles.list}>
        {todo.map((item) => (
          <TodoRow key={item.id} item={item} run={runs[item.id]} onRun={() => onRun(item.id)} />
        ))}
      </View>

      <View style={styles.row}>
        {allDone ? (
          <PillButton label="Klaar" onPress={onClose} style={styles.grow} />
        ) : (
          <>
            <PillButton
              label="Laat Kate alles regelen"
              variant="secondary"
              onPress={onRunAll}
              style={styles.grow}
            />
            <PillButton label="Later" variant="link" onPress={onClose} />
          </>
        )}
      </View>
    </>
  );
}

function TodoRow({ item, run, onRun }: { item: TodoItem; run?: TodoRun; onRun: () => void }) {
  const done = item.status === 'done';
  return (
    <View style={[styles.item, done && styles.itemOk, item.status === 'failed' && styles.itemFailed]}>
      <Dot ok={done} />
      <View style={styles.text}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
        <Text style={styles.base}>bouwt op: {item.basedOn}</Text>
        <View style={styles.act}>
          {item.status === 'open' && <PillButton label="Laat Kate dit doen" small onPress={onRun} />}
          {item.status === 'running' && <Steps steps={item.steps} done={run?.stepsDone ?? 0} />}
          {done && <Text style={styles.okText}>Geregeld door Kate</Text>}
          {item.status === 'failed' && (
            <View style={styles.failed}>
              <Text style={styles.errorText} role="alert">
                {run?.error ?? 'Er liep iets mis.'}
              </Text>
              <PillButton label="Opnieuw proberen" small onPress={onRun} />
            </View>
          )}
        </View>
      </View>
      <Text style={styles.price}>{item.price}</Text>
    </View>
  );
}

function Steps({ steps, done }: { steps: string[]; done: number }) {
  return (
    <View style={styles.steps} aria-live="polite">
      {steps.map((step, i) => {
        const ticked = i < done;
        return (
          <View key={step} style={styles.step}>
            <View style={[styles.tick, ticked && styles.tickDone]}>
              <Text style={styles.tickMark}>✓</Text>
            </View>
            <Text style={[styles.stepText, ticked && styles.stepDone]}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
}

function Dot({ ok }: { ok?: boolean }) {
  return (
    <View style={[styles.dot, ok && styles.dotOk]}>
      {ok && <Text style={styles.dotMark}>✓</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  groupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  group: {
    fontFamily: font.body800,
    fontSize: 11.5,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 6,
  },
  groupOk: { color: '#157a42' },
  groupTodo: { color: '#b65b00' },
  count: { fontFamily: font.body800, fontSize: 11.5, color: world.soft, fontVariant: ['tabular-nums'] },
  list: { gap: 8, marginBottom: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#f3dcc2',
    backgroundColor: '#fffaf4',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemOk: { borderColor: '#cdebd8', backgroundColor: '#f3fbf6' },
  itemFailed: { borderColor: '#f3c2c2', backgroundColor: '#fff6f6' },
  text: { flex: 1, minWidth: 0 },
  itemTitle: { fontFamily: font.body800, fontSize: 14, lineHeight: 18, color: world.ink },
  itemDesc: { fontFamily: font.body600, fontSize: 12, lineHeight: 16.2, color: world.soft },
  base: {
    alignSelf: 'flex-start',
    marginTop: 4,
    fontFamily: font.body800,
    fontSize: 11,
    color: world.blue,
    backgroundColor: '#e6f0fb',
    borderRadius: 999,
    paddingVertical: 1,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  act: { marginTop: 8, alignItems: 'flex-start' },
  price: { fontFamily: font.body800, fontSize: 13, color: world.ink, fontVariant: ['tabular-nums'] },
  okText: { fontFamily: font.body800, fontSize: 12, color: '#157a42' },
  failed: { gap: 6, alignItems: 'flex-start' },
  errorText: { fontFamily: font.body700, fontSize: 12, lineHeight: 16, color: '#b42318' },
  steps: { gap: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tick: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e3ebf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickDone: { backgroundColor: world.good },
  tickMark: { color: '#fff', fontSize: 11, fontFamily: font.body800 },
  stepText: { fontFamily: font.body700, fontSize: 12.5, color: world.soft },
  stepDone: { color: world.ink },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#f0a45a',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  dotOk: { borderWidth: 0, backgroundColor: world.good },
  dotMark: { color: '#fff', fontSize: 11, fontFamily: font.body800 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grow: { flexGrow: 1 },
});
