// Small shared drawings on places: brand signs, attachment signposts, KBC shields, the Kate flag, sparkles.
// All in local coordinates. Signage carries styles.sign so the ghost look keeps it readable (faintly).

import styles from '../street.module.css';
import type { Brand } from '../types';
import { labelFont } from './font';

/** Rough width of Fredoka 600 text, so boards fit their lettering. */
export const textWidth = (text: string, size: number) => text.length * size * 0.56;

export function BrandSign({
  brand,
  cx,
  y,
  size = 13,
  minWidth = 0,
}: {
  brand: Pick<Brand, 'name' | 'colors'>;
  /** Centre of the board. */
  cx: number;
  /** Top of the board. */
  y: number;
  size?: number;
  minWidth?: number;
}) {
  const w = Math.max(minWidth, textWidth(brand.name, size) + 16);
  const h = size + 11;
  return (
    <g className={styles.sign}>
      <rect x={cx - w / 2} y={y} width={w} height={h} rx={h / 2.6} fill={brand.colors.primary} filter="url(#lift)" />
      {brand.colors.secondary && (
        <rect x={cx - w / 2 + 5} y={y + h - 4} width={w - 10} height={2} rx={1} fill={brand.colors.secondary} />
      )}
      <text x={cx} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fill={brand.colors.text} {...labelFont}>
        {brand.name}
      </text>
    </g>
  );
}

/** A partner drawn as a detail: a little signpost (or a sticker, without the post). */
export function AttachmentSign({ brand, cx, base, post = true }: { brand: Brand; cx: number; base: number; post?: boolean }) {
  const size = 10.5;
  const w = textWidth(brand.name, size) + 12;
  const h = 18;
  const top = post ? base - 34 : base - h;
  return (
    <>
      {post && <rect x={cx - 1.5} y={top + h - 2} width={3} height={base - top - h + 2} rx={1.5} fill="#8a6a4a" />}
      <g className={styles.sign}>
        <rect x={cx - w / 2} y={top} width={w} height={h} rx={5} fill={brand.colors.primary} stroke="#fff" strokeWidth={1.5} />
        <text x={cx} y={top + 12.6} textAnchor="middle" fontSize={size} fill={brand.colors.text} {...labelFont}>
          {brand.name}
        </text>
      </g>
    </>
  );
}

export const attachmentWidth = (brand: Brand) => textWidth(brand.name, 10.5) + 12;

/** KBC insurance badge on the place it protects. */
export function Shield({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className={styles.keep}>
      <path d="M0 -12 L10 -8 L10 0 C10 7 5 11 0 13 C-5 11 -10 7 -10 0 L-10 -8 Z" fill="url(#shield)" stroke="#fff" strokeWidth={2} filter="url(#lift)" />
      <path d="M-4.2 0.5 l3 3 l5.6 -6" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Kate has a tip here: a small pennant with her logo, bobbing at her 3.2s rhythm. */
export function KateFlag({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className={styles.keep}>
      <g className={styles.bob}>
        <rect x={-1} y={-34} width={2.4} height={34} rx={1.2} fill="#5a6b82" />
        <path d="M1.4 -34 L26 -27 L1.4 -19 Z" fill="#009fe3" />
        <use href="#kateLogo" x={-9} y={-52} width={20} height={20} filter="url(#lift)" />
      </g>
    </g>
  );
}

export function Sparkles({ cx, cy, spread = 50 }: { cx: number; cy: number; spread?: number }) {
  const points = [0, 60, 120, 180, 240, 300].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return [cx + Math.cos(r) * spread, cy + Math.sin(r) * spread * 0.7] as const;
  });
  return (
    <g aria-hidden>
      {points.map(([x, y], i) => (
        <path
          key={i}
          className={styles.sparkle}
          style={{ animationDelay: `${i * 30}ms` }}
          d={`M${x} ${y - 8} L${x + 2.4} ${y - 2.4} L${x + 8} ${y} L${x + 2.4} ${y + 2.4} L${x} ${y + 8} L${x - 2.4} ${y + 2.4} L${x - 8} ${y} L${x - 2.4} ${y - 2.4} Z`}
          fill="#ffd34d"
        />
      ))}
    </g>
  );
}
