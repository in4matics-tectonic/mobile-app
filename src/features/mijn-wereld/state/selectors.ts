// Derived view data. Keeps phase-dependent rules out of the components.

import type { DomainInfo, DomainStatus, MijnWereldState, Phase } from './types';

interface FamilyView {
  islandLabel: string;
  chip: { label: string; tone: DomainStatus };
  summary: string;
}

export function familyView(phase: Phase, displayName: string): FamilyView {
  switch (phase) {
    case 'ask':
      return {
        islandLabel: 'Gezin · 2 + ?',
        chip: { label: '?', tone: 'warn' },
        summary: 'Wordt jullie gezin groter?',
      };
    case 'confirmed':
      return {
        islandLabel: 'Gezin · 2 + 1',
        chip: { label: '2 + 1', tone: 'info' },
        summary: 'Kleine spruit op komst',
      };
    case 'done':
      return {
        islandLabel: 'Gezin · 2 + 1',
        chip: { label: 'klaar', tone: 'ok' },
        summary: 'Klaar voor de geboorte',
      };
    default:
      return { islandLabel: 'Gezin · 2', chip: { label: '2', tone: 'info' }, summary: displayName };
  }
}

export function selectTiles(state: MijnWereldState): DomainInfo[] {
  const family = familyView(state.phase, state.customer?.displayName ?? '');
  return state.domains
    .filter((d) => d.tile)
    .map((d) => (d.id === 'gezin' ? { ...d, chip: family.chip, summary: family.summary } : d));
}
