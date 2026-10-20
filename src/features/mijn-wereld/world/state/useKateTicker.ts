// The Kate bar's rotation (4.9), shared by the in-flow bar and its docked copy so the teaser never jumps.
// Every 6s the next teaser takes over. Findings that weren't there before each take the front once, in turn
// (an arrival first), with the bar's new-finding animation; after that the bar follows priority.

import { useEffect, useState } from 'react';

import type { Finding } from '../types';

const ROTATE_MS = 6000;
const ROTATE_REDUCED_MS = 8000;

export interface KateTicker {
  current: Finding | undefined;
  index: number;
  count: number;
  /** Bumped when a new finding takes the front: the bar pulses, lifts and types it in. */
  newKey: number;
  /** The finding that arrived last, for the screen reader announcement. */
  announced: Finding | undefined;
}

export function useKateTicker(findings: Finding[], { paused, reduced }: { paused: boolean; reduced: boolean }): KateTicker {
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [newKey, setNewKey] = useState(0);
  const [announced, setAnnounced] = useState<Finding | undefined>(undefined);
  /** Ids seen so far; null until the first findings arrive (those are just "what Kate found"). */
  const [known, setKnown] = useState<string[] | null>(null);
  /** New findings still waiting for their turn at the front. */
  const [queue, setQueue] = useState<string[]>([]);
  const [previous, setPrevious] = useState<Finding[]>(findings);

  const showNew = (id: string) => {
    setCurrentId(id);
    setAnnounced(findings.find((f) => f.id === id));
    setNewKey((k) => k + 1);
  };

  if (previous !== findings) {
    setPrevious(findings);
    if (known === null) {
      if (findings.length) setKnown(findings.map((f) => f.id));
    } else {
      const fresh = findings.filter((f) => !known.includes(f.id));
      if (fresh.length) {
        setKnown([...known, ...fresh.map((f) => f.id)]);
        const ordered = [...fresh.filter((f) => f.kind === 'arrived'), ...fresh.filter((f) => f.kind !== 'arrived')];
        const [first, ...rest] = ordered;
        showNew(first.id);
        setQueue((q) => [...q, ...rest.map((f) => f.id)]);
      }
    }
  }

  const index = Math.max(
    0,
    findings.findIndex((f) => f.id === currentId),
  );
  const current = findings[index];

  useEffect(() => {
    if (paused || findings.length < 2) return;
    const timer = setTimeout(() => {
      const waiting = queue.filter((id) => findings.some((f) => f.id === id));
      if (waiting.length) {
        const [next, ...rest] = waiting;
        setQueue(rest);
        setCurrentId(next);
        setAnnounced(findings.find((f) => f.id === next));
        setNewKey((k) => k + 1);
        return;
      }
      setCurrentId(findings[(index + 1) % findings.length].id);
    }, reduced ? ROTATE_REDUCED_MS : ROTATE_MS);
    return () => clearTimeout(timer);
  }, [paused, reduced, findings, index, newKey, queue]);

  return { current, index, count: findings.length, newKey, announced };
}
