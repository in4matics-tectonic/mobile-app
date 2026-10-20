// One place on the street: a keyboard-accessible hotspot around its avatar, the linked/ghost look (both drawn,
// crossfaded on a change), shields, attachments, the Kate flag, and the arrival when it's new.

import type { KeyboardEvent } from 'react';

import { avatarFor } from './avatars';
import { TIP_MIN } from './categories';
import { GROUND_Y, type PositionedPlace } from './layout';
import { AttachmentSign, attachmentWidth, KateFlag, Shield, Sparkles } from './scene/Badges';
import { Plot, PLOT_TOP } from './scene/Plot';
import styles from './street.module.css';
import type { Household, Place as PlaceData } from './types';

export type ArrivalPhase = 'pending' | 'sinking' | 'arriving';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

function onActivate(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
}

export function placeAriaLabel(place: PlaceData) {
  const brands = place.brands.filter((b) => b.partnerId !== 'kbc').map((b) => b.name);
  const name = [place.label, ...brands].join(' ');
  const state =
    place.state === 'linked' ? 'gekoppeld' : place.state === 'ghost' ? 'nog niet gekoppeld' : 'hier kan je wereld groeien';
  return `${name}, ${state}`;
}

export function Place({
  item,
  household,
  phase,
  fromPlot,
  leaving,
  locked,
  wave,
  onSelect,
  onSelectAttachment,
}: {
  item: PositionedPlace;
  household: Household;
  /** Set while the place is new and its arrival hasn't finished. */
  phase?: ArrivalPhase;
  /** The plot this place grows out of, shown until it sinks. */
  fromPlot?: string;
  /** Fading out: its last link went away. */
  leaving?: boolean;
  /** During the fly-in nothing is tappable. */
  locked: boolean;
  wave: boolean;
  onSelect: (id: string) => void;
  onSelectAttachment: (placeId: string, partnerId: string) => void;
}) {
  const { place, x, width } = item;
  const spec = avatarFor(place.id, width, place.brands.length);
  const isPlot = place.state === 'plot';
  const top = isPlot ? PLOT_TOP : spec.top;
  const flag = place.tips.some((t) => (t.score ?? 0) >= TIP_MIN);
  const select = () => !locked && onSelect(place.id);
  const avatarProps = { width, label: place.label, brands: place.brands, household, wave };
  const { Avatar } = spec;

  // Attachments: signposts in a row in front of the place, or stickers on it (the car).
  const widths = place.attachments.map(attachmentWidth);
  const total = widths.reduce((a, b) => a + b, 0) + Math.max(0, widths.length - 1) * 6;
  const start = spec.attachRight ? width - total - 2 : width / 2 - total / 2;
  const attachments = place.attachments.map((brand, i) => {
    const before = widths.slice(0, i).reduce((a, b) => a + b + 6, 0);
    return { brand, cx: start + before + widths[i] / 2 };
  });

  return (
    <g
      className={styles.slot}
      style={{ transform: `translate(${x}px, 0px)`, opacity: leaving ? 0 : 1, transition: 'transform 400ms ease-out, opacity 300ms' }}>
      <g
        className={styles.place}
        role="button"
        tabIndex={locked ? -1 : 0}
        aria-label={placeAriaLabel(place)}
        onClick={select}
        onKeyDown={onActivate(select)}
        style={{ pointerEvents: locked ? 'none' : undefined }}>
        <rect className={styles.focusRing} x={-6} y={top - 12} width={width + 12} height={GROUND_Y - top + 22} rx={14} fill="transparent" />
        {phase === 'arriving' && (
          <circle className={styles.burst} cx={width / 2} cy={top + (GROUND_Y - top) * 0.6} r={Math.max(60, width * 0.75)} fill="url(#burst)" />
        )}
        {fromPlot !== undefined && phase !== 'arriving' && (
          <g className={phase === 'sinking' ? styles.sinking : undefined}>
            <Plot width={width} name={fromPlot} />
          </g>
        )}
        <g className={cx(styles.grow, phase === 'pending' || phase === 'sinking' ? styles.pending : phase === 'arriving' && styles.arriving)}>
          <g className={styles.lift}>
            {isPlot ? (
              <Plot width={width} name={place.plotName ?? place.label} />
            ) : (
              <>
                <g className={cx(styles.layer, place.state === 'ghost' && styles.hidden)}>
                  <Avatar {...avatarProps} />
                </g>
                <g className={cx(styles.layer, styles.breathe, place.state !== 'ghost' && styles.hidden)} aria-hidden>
                  <g className={styles.ghostFill}>
                    <Avatar {...avatarProps} />
                  </g>
                  <g className={styles.ghost}>
                    <Avatar {...avatarProps} />
                  </g>
                </g>
              </>
            )}
            {place.shields.slice(0, 2).map((id, i) => (
              <Shield key={id} x={width - 12 - i * 22} y={top + 14} />
            ))}
            {/* A plot's signpost already carries Kate's logo. */}
            {flag && !isPlot && <KateFlag x={spec.flag.x} y={spec.flag.y} />}
          </g>
        </g>
        {phase === 'arriving' && <Sparkles cx={width / 2} cy={top + (GROUND_Y - top) / 2} spread={Math.max(40, width / 2)} />}
      </g>
      {attachments.map(({ brand, cx: acx }) => {
        const open = () => !locked && onSelectAttachment(place.id, brand.partnerId);
        return (
          <g
            key={brand.partnerId}
            className={cx(styles.attachment, brand.state === 'ghost' && styles.ghost, brand.state === 'ghost' && styles.breathe)}
            role="button"
            tabIndex={locked ? -1 : 0}
            aria-label={`${brand.name} bij ${place.label}, ${brand.state === 'linked' ? 'gekoppeld' : 'nog niet gekoppeld'}`}
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            onKeyDown={onActivate(open)}
            style={{ pointerEvents: locked ? 'none' : undefined, opacity: phase === 'pending' ? 0 : 1 }}>
            <AttachmentSign brand={brand} cx={acx} base={spec.stickerY ?? GROUND_Y + 6} post={spec.stickerY === undefined} />
          </g>
        );
      })}
    </g>
  );
}
