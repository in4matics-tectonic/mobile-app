// A clickable domain on the island: a keyboard-accessible <g role="button"> with a pill badge.

import type { KeyboardEvent, ReactNode } from 'react';

import type { Domain } from '../../state/types';
import styles from '../island.module.css';
import { labelFont } from './font';

export function Hotspot({
  domain,
  label,
  onSelect,
  children,
}: {
  domain: Domain;
  label: string;
  onSelect: (domain: Domain) => void;
  children: ReactNode;
}) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(domain);
    }
  };
  return (
    <g
      className={styles.spot}
      tabIndex={0}
      role="button"
      aria-label={`${label} openen`}
      onClick={() => onSelect(domain)}
      onKeyDown={onKeyDown}>
      {children}
    </g>
  );
}

export function Badge({
  x,
  y,
  width,
  text,
  textX,
  check,
}: {
  x: number;
  y: number;
  width: number;
  text: string;
  textX: number;
  /** Position of the green check, if the domain is verified. */
  check?: { x: number; y: number };
}) {
  return (
    <g className={styles.badge}>
      <rect x={x} y={y} width={width} height="20" rx="10" fill="#fff" filter="url(#lift)" />
      <text x={textX} y={y + 14} textAnchor="middle" fontSize="11.5" fill="#12305a" {...labelFont}>
        {text}
      </text>
      {check && <use href="#check" x={check.x} y={check.y} />}
    </g>
  );
}
