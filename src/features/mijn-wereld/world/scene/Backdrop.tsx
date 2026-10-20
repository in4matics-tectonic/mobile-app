// Everything around the places: clouds, birds and a balloon, the far range, hills and skyline, the road and the
// footpath with people walking, the sea and the island's land, connectors between zones, trees and waves, the
// plane. World units (layout.ts).
//
// Layers scroll at their own speed (PARALLAX). A layer at factor f is shifted by scroll × (1 − f), so a
// world x maps to layer x `vw/2 + f·(x − vw/2)`: drawn there, it passes the screen centre together with x.

import type { CSSProperties } from 'react';

import styles from '../street.module.css';
import { ZONE_LABELS } from '../categories';
import { PARALLAX, type WorldLayout } from '../layout';
import type { ZoneId } from '../types';
import { CloudShape, type CloudShapeId } from './Cloud';
import { labelFont } from './font';

/** `flat`: reduced motion stops parallax, so every layer maps 1:1. */
const at = (f: number, vw: number, flat?: boolean) => (x: number) => (flat ? x : vw / 2 + f * (x - vw / 2));

/** Stable pseudo-random in [0, 1): the same world always draws the same scenery. */
const rnd = (i: number, salt = 0) => {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** CSS custom properties for the keyframes that read them. */
const vars = (v: Record<string, string | number>) => v as CSSProperties;

interface LayerProps {
  layout: WorldLayout;
  vw: number;
  flat?: boolean;
}

const SEA_TOP = 432;
const PATH_Y = 490;

/** Where the mainland ends and where the island's land sits. */
export function landmarks(layout: WorldLayout) {
  const sea = layout.connectors.find((c) => c.kind === 'sea');
  const away = layout.zones.find((z) => z.id === 'away');
  return { landEnd: sea ? sea.x + 30 : layout.width, sea, away };
}

// ---------- Sky: clouds, birds, the balloon ----------

const SHAPES: CloudShapeId[] = ['a', 'b', 'c'];

export function Clouds({ layout, vw, flat }: LayerProps) {
  const map = at(PARALLAX.clouds, vw, flat);
  const from = map(0) - 120;
  const to = map(layout.width) + vw;
  const clouds = [];
  // Two depths: small pale clouds far back drift slowly, bigger ones closer drift faster.
  for (let x = from, i = 0; x < to; x += 190, i++) {
    const far = i % 2 === 1;
    const k = far ? 0.3 + rnd(i) * 0.1 : 0.46 + rnd(i, 1) * 0.18;
    const y = far ? 210 + rnd(i, 2) * 36 : 128 + rnd(i, 3) * 64;
    clouds.push(
      <g
        key={i}
        className={styles.cloud}
        style={{ animationDuration: `${far ? 38 : 26}s`, animationDelay: `${-rnd(i, 4) * 26}s` }}>
        <g transform={`translate(${x + rnd(i, 5) * 50} ${y}) scale(${k})`} opacity={far ? 0.78 : 1}>
          <CloudShape shape={SHAPES[i % 3]} />
        </g>
      </g>,
    );
  }
  const home = layout.zones.find((z) => z.id === 'home');
  const town = layout.zones.find((z) => z.id === 'town');
  return (
    <g aria-hidden>
      {clouds}
      {home && <Balloon x={map(home.x1 - 70)} y={206} />}
      <Flock x={map(-40)} y={232} fly={520} delay={-6} />
      {town && <Flock x={map(town.x0 - 120)} y={204} fly={640} delay={-22} />}
    </g>
  );
}

function Flock({ x, y, fly, delay }: { x: number; y: number; fly: number; delay: number }) {
  const birds = [
    [0, 0, 1],
    [-16, 9, 0.8],
    [14, 12, 0.85],
  ] as const;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={styles.flock} style={{ ...vars({ '--fly': `${fly}px` }), animationDelay: `${delay}s` }}>
        {birds.map(([bx, by, k], i) => (
          <g key={i} transform={`translate(${bx} ${by}) scale(${k})`}>
            <path
              className={styles.flap}
              style={{ animationDelay: `${-i * 0.17}s` }}
              d="M-8 0 Q-4 -6 0 0 Q4 -6 8 0"
              stroke="#35506f"
              strokeWidth={1.9}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </g>
    </g>
  );
}

function Balloon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={styles.balloonDrift}>
        <g className={styles.balloonBob}>
          <path d="M-4.5 23 L-6 34 M4.5 23 L6 34" stroke="#8a6a4a" strokeWidth={1} />
          <path d="M0 -27 C 17 -27, 23 -12, 21 1 C 19 12, 9 18, 4.5 24 L -4.5 24 C -9 18, -19 12, -21 1 C -23 -12, -17 -27, 0 -27 Z" fill="url(#balloon)" />
          <path d="M0 -27 C 8 -18, 9 9, 3.4 24 L -3.4 24 C -9 9, -8 -18, 0 -27 Z" fill="#ffffff" opacity={0.92} />
          <path d="M-20.6 4 C -10 8.5, 10 8.5, 20.6 4 L 18.6 9.6 C 8 13, -8 13, -18.6 9.6 Z" fill="#ffd34d" />
          <ellipse cx={-10} cy={-12} rx={3.6} ry={8} fill="#ffffff" opacity={0.35} transform="rotate(18 -10 -12)" />
          <rect x={-6.5} y={33} width={13} height={9} rx={2.4} fill="#a0673a" />
          <rect x={-7.5} y={32} width={15} height={2.6} rx={1.3} fill="#c98a4b" />
        </g>
      </g>
    </g>
  );
}

// ---------- Distance: the far range, hills, the village, the skyline ----------

/** Soft mountains on the horizon, on their own slow layer. */
export function FarLayer({ layout, vw, flat }: LayerProps) {
  const map = at(PARALLAX.far, vw, flat);
  const { landEnd } = landmarks(layout);
  const x0 = map(0) - vw;
  const x1 = map(landEnd) + 120;
  let d = `M${x0} 430 L${x0} 396`;
  for (let x = x0, i = 0; x < x1; x += 170, i++) {
    const peak = 312 + rnd(i, 7) * 44;
    d += ` C ${x + 50} ${peak}, ${x + 110} ${peak}, ${x + 170} ${392 + rnd(i, 8) * 8}`;
  }
  d += ` L${x1 + 170} 430 Z`;
  return (
    <g aria-hidden>
      <path d={d} fill="url(#farRange)" opacity={0.9} />
    </g>
  );
}

function hills(x0: number, x1: number, base: number, height: number, step: number) {
  let d = `M${x0} 430 L${x0} ${base}`;
  for (let x = x0, i = 0; x < x1; x += step, i++) {
    const h = height * (i % 2 ? 0.7 : 1);
    d += ` Q ${x + step / 2} ${base - h} ${x + step} ${base}`;
  }
  return `${d} L${x1 + step} 430 Z`;
}

/** Little round trees along the crests of the far hills. */
function crestTrees(x0: number, x1: number, base: number, height: number, step: number) {
  const trees = [];
  for (let x = x0, i = 0; x < x1; x += step, i++) {
    const h = height * (i % 2 ? 0.7 : 1);
    for (const [t, k] of [
      [0.32, 1],
      [0.4, 0.8],
      [0.66, 0.9],
    ] as const) {
      if (rnd(i, t * 10) < 0.35) continue;
      const tx = x + t * step;
      const ty = base - 2 * t * (1 - t) * h;
      trees.push(
        <g key={`${i}-${t}`} transform={`translate(${tx} ${ty + 2}) scale(${k})`}>
          <rect x={-1} y={-6} width={2} height={6} fill="#6f8f52" />
          <circle cx={0} cy={-10} r={6} fill="#74c25c" />
          <circle cx={-1.8} cy={-12} r={2.4} fill="#a4e08a" />
        </g>,
      );
    }
  }
  return trees;
}

export function BackLayer({ layout, vw, flat }: LayerProps) {
  const map = at(PARALLAX.back, vw, flat);
  const { landEnd } = landmarks(layout);
  const town = layout.zones.find((z) => z.id === 'town');
  const firstSign = layout.connectors.find((c) => c.kind === 'sign');
  const x0 = map(0) - vw;
  const x1 = map(landEnd);
  return (
    <g aria-hidden>
      <path d={hills(x0, x1, 400, 70, 260)} fill="url(#hillFar)" />
      <g>{crestTrees(x0, x1, 400, 70, 260)}</g>
      {firstSign && <Village x={map(firstSign.x + firstSign.width / 2) + 40} />}
      {town && <Skyline x0={map(town.x0)} x1={map(town.x1)} />}
      <path d={hills(x0 + 90, x1, 412, 46, 200)} fill="url(#hill)" />
    </g>
  );
}

/** A Flemish village on the hill between home and the neighbourhood: a church tower and a few roofs. */
function Village({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`} opacity={0.92}>
      <rect x={-6} y={322} width={14} height={50} fill="#e9dccb" />
      <rect x={8} y={322} width={4} height={50} fill="#cbbba5" />
      <path d="M-7 323 L1 290 L9 323 Z" fill="#7d8ca3" />
      <path d="M1 290 L9 323 L13 323 Z" fill="#62708a" />
      <rect x={0.2} y={282} width={1.6} height={9} fill="#7d8ca3" />
      <circle cx={1} cy={336} r={3.2} fill="#ffffff" stroke="#b9a68a" strokeWidth={1} />
      {[
        [-34, 352, 22],
        [14, 356, 20],
        [-58, 360, 18],
        [36, 362, 18],
      ].map(([hx, hy, w], i) => (
        <g key={i}>
          <rect x={hx} y={hy} width={w} height={372 - hy + 6} fill={i % 2 ? '#f3e8d6' : '#efe0c8'} />
          <path d={`M${hx - 2} ${hy + 1} L${hx + w / 2} ${hy - 10} L${hx + w + 2} ${hy + 1} Z`} fill={i % 2 ? '#d9785a' : '#c86a4a'} />
          <rect x={hx + w / 2 - 2.5} y={hy + 6} width={5} height={5} rx={1} fill="#ffd77a" />
        </g>
      ))}
    </g>
  );
}

function Skyline({ x0, x1 }: { x0: number; x1: number }) {
  const back = [];
  for (let x = x0 - 70, i = 0; x < x1 + 60; x += 46, i++) {
    const h = 120 + rnd(i, 11) * 70;
    back.push(<rect key={`b${i}`} x={x} y={404 - h} width={40} height={h} rx={2} fill="#c9def3" />);
  }
  const front = [];
  const heights = [96, 140, 74, 120, 160, 88, 130, 104];
  for (let x = x0 - 40, i = 0; x < x1 + 40; x += 36, i++) {
    const h = heights[i % heights.length];
    const top = 404 - h;
    front.push(
      <g key={i}>
        <rect x={x} y={top} width={31} height={h} rx={2.5} fill="url(#skyline)" />
        <rect x={x + 3} y={top + 8} width={25} height={h - 16} fill="url(#litWindows)" />
        {i % 4 === 0 && <rect x={x + 14.5} y={top - 16} width={2} height={16} fill="#9cc0e6" />}
        {i % 4 === 0 && <circle cx={x + 15.5} cy={top - 17} r={2.2} fill="#ff8a66" />}
        {i % 4 === 2 && <rect x={x + 6} y={top - 9} width={19} height={10} rx={2} fill="#a9c9ea" />}
      </g>,
    );
  }
  return (
    <g opacity={0.92}>
      <g opacity={0.8}>{back}</g>
      {front}
    </g>
  );
}

// ---------- The ground: road, footpath, sea ----------

export function Ground({ layout, busFrom, busTo }: { layout: WorldLayout; busFrom?: number; busTo?: number }) {
  const { landEnd, sea, away } = landmarks(layout);
  const w = layout.width;
  const zone = (id: ZoneId) => layout.zones.find((z) => z.id === id);
  const home = zone('home');
  const neighbourhood = zone('neighbourhood');
  const town = zone('town');
  return (
    <g aria-hidden>
      <defs>
        <clipPath id="belowSeaTop">
          <rect x={-1000} y={SEA_TOP} width={w + 3000} height={400} />
        </clipPath>
      </defs>
      {sea && (
        <>
          <rect x={sea.x} y={SEA_TOP} width={w - sea.x + 400} height={200} fill="url(#sea)" />
          <path d={`M${sea.x} ${SEA_TOP + 2} H${w + 400}`} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={2} />
          <SeaSparkles x0={sea.x + 40} x1={w + 200} />
        </>
      )}
      {/* mainland: verge, curb, road, lawn with a footpath, and a beach where it meets the sea */}
      <rect x={-400} y={398} width={landEnd + 400} height={32} fill="url(#verge)" />
      <Tufts x0={-380} x1={landEnd - 60} y0={404} y1={416} step={23} salt={1} />
      <rect x={-400} y={421} width={landEnd + 400} height={7} fill="#eef3f8" />
      <rect x={-400} y={427} width={landEnd + 400} height={41} fill="url(#asphalt)" />
      <rect x={-400} y={426.5} width={landEnd + 400} height={1.6} fill="#aebccd" />
      <path d={`M-400 432 H${landEnd - 30} M-400 462 H${landEnd - 30}`} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={1.4} />
      <path d={`M-400 447 H${landEnd - 20}`} stroke="#f4f7fb" strokeWidth={3} strokeDasharray="18 16" />
      <rect x={-400} y={468} width={landEnd + 400} height={140} fill="url(#lawn)" />
      <rect x={-400} y={466} width={landEnd + 400} height={4} fill="#c9d5e3" />
      <rect x={-400} y={466} width={landEnd + 400} height={1.4} fill="#eef3f8" />
      <Tufts x0={-380} x1={landEnd - 60} y0={474} y1={486} step={31} salt={2} />
      <rect x={-400} y={PATH_Y} width={landEnd + 340} height={13} fill="url(#paving)" />
      <path d={`M-400 ${PATH_Y + 0.6} H${landEnd - 60}`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1.2} />
      <path d={`M-400 ${PATH_Y + 13} H${landEnd - 60}`} stroke="#c8b07c" strokeWidth={1.4} />
      <path d={`M-400 ${PATH_Y + 6.5} H${landEnd - 60}`} stroke="#d8c294" strokeWidth={13} strokeDasharray="1 17" />
      <Flowers x0={-360} x1={landEnd - 90} />
      {sea && (
        <>
          <path d={`M${landEnd - 40} 396 C ${landEnd} 400, ${landEnd + 20} 440, ${landEnd + 60} 620 L${landEnd - 40} 620 Z`} fill="url(#sand)" />
          <path
            className={styles.foam}
            clipPath="url(#belowSeaTop)"
            d={`M${landEnd - 40} 396 C ${landEnd} 400, ${landEnd + 20} 440, ${landEnd + 60} 620`}
            stroke="#ffffff"
            strokeOpacity={0.8}
            strokeWidth={3.4}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {/* the island's land across the sea */}
      {away && (
        <>
          <path
            className={styles.foam}
            clipPath="url(#belowSeaTop)"
            d={`M${away.x0 - 4} 472 C ${away.x0 + 12} 418, ${away.x0 + 30} 406, ${away.x0 + 60} 406 L${away.x1 - 60} 406 C ${away.x1 - 30} 406, ${away.x1 - 12} 418, ${away.x1 + 4} 472 C ${away.x1 - 60} 496, ${away.x0 + 60} 496, ${away.x0 - 4} 472 Z`}
            stroke="#ffffff"
            strokeOpacity={0.75}
            strokeWidth={3.4}
            fill="none"
          />
          <path
            d={`M${away.x0} 470 C ${away.x0 + 16} 420, ${away.x0 + 30} 410, ${away.x0 + 60} 410 L${away.x1 - 60} 410 C ${away.x1 - 30} 410, ${away.x1 - 16} 420, ${away.x1} 470 C ${away.x1 - 60} 490, ${away.x0 + 60} 490, ${away.x0} 470 Z`}
            fill="url(#sand)"
          />
          <rect x={away.x0 + 44} y={406} width={away.x1 - away.x0 - 88} height={22} rx={11} fill="url(#verge)" />
          <Starfish x={away.x0 + 70} y={452} />
          <Starfish x={away.x1 - 90} y={460} k={0.8} />
        </>
      )}
      {layout.connectors.map((c) => (c.kind === 'sign' ? <ZoneSign key={c.to} x={c.x + c.width / 2} to={c.to} /> : <Boat key={c.to} x={c.x + c.width / 2} />))}
      {home && <Walker kind="dog" from={home.x0 + 20} to={home.x1 - 30} dur={46} delay={-8} />}
      {neighbourhood && <Walker kind="shopper" from={neighbourhood.x0 + 30} to={neighbourhood.x1 - 30} dur={58} delay={-31} />}
      {town && <Walker kind="cyclist" from={town.x0 - 40} to={town.x1} dur={30} delay={-4} />}
      {busFrom !== undefined && busTo !== undefined && <Bus from={busFrom} to={busTo} />}
    </g>
  );
}

function Tufts({ x0, x1, y0, y1, step, salt }: { x0: number; x1: number; y0: number; y1: number; step: number; salt: number }) {
  const d = [];
  for (let x = x0, i = 0; x < x1; x += step, i++) {
    const tx = x + rnd(i, salt) * step * 0.8;
    const ty = y0 + rnd(i, salt + 0.5) * (y1 - y0);
    d.push(`M${tx - 3} ${ty} q1 -4 0.6 -7 M${tx} ${ty} q0 -5 1 -9 M${tx + 3} ${ty} q0 -4 2 -6`);
  }
  return <path d={d.join(' ')} stroke="#3f9d3c" strokeOpacity={0.55} strokeWidth={1.4} strokeLinecap="round" fill="none" />;
}

const PETALS = ['#ff6b8a', '#ffd34d', '#ffffff', '#b48cff', '#ff9f43'];

function Flowers({ x0, x1 }: { x0: number; x1: number }) {
  const beds = [];
  for (let x = x0, i = 0; x < x1; x += 64, i++) {
    if (rnd(i, 21) < 0.3) continue;
    const fx = x + rnd(i, 22) * 40;
    const fy = 516 + rnd(i, 23) * 40;
    const color = PETALS[i % PETALS.length];
    beds.push(
      <g key={i} transform={`translate(${fx} ${fy})`}>
        <path d="M-7 3 q3 -6 7 -4 q4 -2 7 4 Z" fill="#3f9d3c" opacity={0.75} />
        {[
          [-4, -2],
          [1, -5],
          [5, -1],
        ].map(([px, py], j) => (
          <g key={j}>
            <circle cx={px} cy={py} r={2.6} fill={color} />
            <circle cx={px} cy={py} r={1} fill={color === '#ffd34d' ? '#ff9f43' : '#ffd34d'} />
          </g>
        ))}
      </g>,
    );
  }
  return <g>{beds}</g>;
}

function SeaSparkles({ x0, x1 }: { x0: number; x1: number }) {
  const n = Math.max(4, Math.floor((x1 - x0) / 70));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + rnd(i, 31) * (x1 - x0);
        const y = 452 + rnd(i, 32) * 110;
        return (
          <path
            key={i}
            className={styles.sparkleIdle}
            style={{ animationDelay: `${-rnd(i, 33) * 3.6}s`, animationDuration: `${3 + rnd(i, 34) * 2}s` }}
            d={`M${x} ${y - 5} L${x + 1.3} ${y - 1.3} L${x + 5} ${y} L${x + 1.3} ${y + 1.3} L${x} ${y + 5} L${x - 1.3} ${y + 1.3} L${x - 5} ${y} L${x - 1.3} ${y - 1.3} Z`}
            fill="#ffffff"
          />
        );
      })}
    </g>
  );
}

function Starfish({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${k})`}
      d="M0 -6 L1.8 -2 L6 -1.6 L2.8 1.2 L3.8 5.4 L0 3.2 L-3.8 5.4 L-2.8 1.2 L-6 -1.6 L-1.8 -2 Z"
      fill="#ff8a66"
      stroke="#e86a48"
      strokeWidth={0.8}
      strokeLinejoin="round"
    />
  );
}

function ZoneSign({ x, to }: { x: number; to: ZoneId }) {
  const text = ZONE_LABELS[to];
  const w = text.length * 7 + 20;
  return (
    <g>
      <rect x={x - 2} y={372} width={4} height={50} rx={2} fill="#8a6a4a" />
      <path d={`M${x - w / 2} 366 H${x + w / 2 - 4} L${x + w / 2 + 6} 377 L${x + w / 2 - 4} 388 H${x - w / 2} Z`} fill="#1f9d55" stroke="#fff" strokeWidth={2} filter="url(#lift)" />
      <text x={x - 3} y={381.5} textAnchor="middle" fontSize={11.5} fill="#fff" {...labelFont}>
        {text}
      </text>
    </g>
  );
}

function Boat({ x }: { x: number }) {
  return (
    <g className={styles.boat}>
      <g transform={`translate(${x} 470)`} filter="url(#lift)">
        <path d="M-26 0 L26 0 L18 12 L-18 12 Z" fill="#f4f7fb" />
        <path d="M-26 0 L26 0 L24 4 L-24 4 Z" fill="#ff6b4a" />
        <rect x={-1} y={-38} width={2.4} height={38} fill="#5a6b82" />
        <path d="M1.4 -36 L22 -4 L1.4 -4 Z" fill="#ffffff" />
        <path d="M-1 -30 L-16 -4 L-1 -4 Z" fill="#cfe3f6" />
      </g>
    </g>
  );
}

function Bus({ from, to }: { from: number; to: number }) {
  return (
    <g className={styles.bus} style={vars({ '--from': `${from}px`, '--to': `${to}px` })}>
      <g transform="translate(0 422)" filter="url(#lift)">
        <rect x={0} y={0} width={92} height={34} rx={7} fill="#ffdd00" />
        <rect x={0} y={24} width={92} height={10} rx={3} fill="#1d1d1b" />
        {[8, 26, 44, 62].map((x) => (
          <rect key={x} x={x} y={6} width={14} height={12} rx={2} fill="#cfefff" />
        ))}
        <rect x={80} y={6} width={9} height={18} rx={2} fill="#a8dcff" />
        <circle cx={20} cy={36} r={6} fill="#1b2433" />
        <circle cx={72} cy={36} r={6} fill="#1b2433" />
      </g>
    </g>
  );
}

// ---------- People on the footpath ----------

type WalkerKind = 'dog' | 'shopper' | 'cyclist';

/** Walks the footpath between `from` and `to` and back, turning at each end. */
function Walker({ kind, from, to, dur, delay }: { kind: WalkerKind; from: number; to: number; dur: number; delay: number }) {
  const timing = { animationDuration: `${dur}s`, animationDelay: `${delay}s` };
  return (
    <g className={styles.patrol} style={{ ...vars({ '--from': `${from}px`, '--to': `${to}px` }), ...timing }}>
      <g transform={`translate(0 ${PATH_Y + 9})`}>
        <g className={styles.patrolTurn} style={timing}>
          {kind === 'dog' && <DogWalker />}
          {kind === 'shopper' && <Shopper />}
          {kind === 'cyclist' && <Cyclist />}
        </g>
      </g>
    </g>
  );
}

/** A small person, phase-1 style, facing right, feet on y 0. */
function Person({ shirt, hair, legs = '#2b3a55', long = false }: { shirt: string; hair: string; legs?: string; long?: boolean }) {
  return (
    <>
      <rect className={styles.stride} x={-3.6} y={-12} width={3.4} height={12} rx={1.7} fill={legs} />
      <rect className={styles.stride} style={{ animationDelay: '-0.45s' }} x={0.4} y={-12} width={3.4} height={12} rx={1.7} fill={legs} />
      <rect x={-5.6} y={-27} width={11.4} height={17} rx={5} fill={shirt} />
      <circle cx={0.6} cy={-32.5} r={6} fill="url(#skin)" />
      <path d={long ? 'M-5.6 -32 q0 -8 6.2 -8 q6.4 0 6 7 l1 6 q-3 1 -3.4 -2 q-1 -4 -3 -6 q-3 3 -6.8 3z' : 'M-5.4 -33 a6 6 0 0 1 12 0 q-3 -3 -6.4 -1.6 q-3 1 -5.6 1.6z'} fill={hair} />
      <circle cx={3.6} cy={-32.6} r={0.85} fill="#1b2433" />
    </>
  );
}

function DogWalker() {
  return (
    <g>
      <Person shirt="#2ab0a0" hair="#6b4226" />
      <path d="M4.5 -16 Q 12 -8 17 -7" stroke="#c0392b" strokeWidth={1} fill="none" />
      <g transform="translate(22 0)">
        <rect className={styles.stride} x={-6} y={-6} width={2.4} height={6} rx={1.2} fill="#8a5431" />
        <rect className={styles.stride} style={{ animationDelay: '-0.45s' }} x={3} y={-6} width={2.4} height={6} rx={1.2} fill="#8a5431" />
        <ellipse cx={0} cy={-8} rx={8} ry={4.6} fill="#c98a4b" />
        <circle cx={7.6} cy={-12} r={4.2} fill="#c98a4b" />
        <path d="M6 -15.5 q1.6 -3.6 3.6 -0.6 z" fill="#8a5431" />
        <circle cx={9.2} cy={-12.6} r={0.7} fill="#1b2433" />
        <circle cx={11.6} cy={-11.2} r={1} fill="#1b2433" />
        <path className={styles.wag} d="M-7.6 -9 q-4 -2 -5 -6" stroke="#c98a4b" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      </g>
    </g>
  );
}

function Shopper() {
  return (
    <g>
      <Person shirt="#ff8a66" hair="#3b2416" legs="#3b2f4a" long />
      <rect x={-9.4} y={-19} width={7} height={8} rx={1.6} fill="#ffd34d" />
      <path d="M-8.4 -19 q2.4 -4 5 0" stroke="#d9a520" strokeWidth={1} fill="none" />
    </g>
  );
}

function Cyclist() {
  return (
    <g>
      <circle cx={-10} cy={-6} r={6} fill="none" stroke="#1b2433" strokeWidth={1.8} />
      <circle cx={10} cy={-6} r={6} fill="none" stroke="#1b2433" strokeWidth={1.8} />
      <path d="M-10 -6 L-3 -16 L7 -16 L10 -6 M-3 -16 L0 -6 L7 -16 M5.5 -19 L9 -19 M-4 -19 L-1 -19" stroke="#ff5c8a" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(-2 -14)">
        <rect className={styles.stride} x={-1.6} y={-2} width={3.2} height={10} rx={1.6} fill="#2b3a55" />
        <rect x={-5} y={-15} width={10} height={14} rx={4.6} fill="#4f6bff" transform="rotate(14 0 -8)" />
        <circle cx={3.6} cy={-19} r={5.4} fill="url(#skin)" />
        <path d="M-2 -21 a6 6 0 0 1 11 0 z" fill="#ffd34d" />
        <circle cx={6.2} cy={-19} r={0.8} fill="#1b2433" />
      </g>
    </g>
  );
}

// ---------- The foreground ----------

export function Foreground({ layout, vw, flat }: LayerProps) {
  const map = at(PARALLAX.foreground, vw, flat);
  const { landEnd, sea } = landmarks(layout);
  const trees = [];
  for (let x = 60, i = 0; x < landEnd - 80; x += 210, i++) {
    const tx = map(x + (i % 2) * 60);
    const k = [1, 0.8, 1.15][i % 3];
    trees.push(i % 3 === 1 ? <Conifer key={i} x={tx} k={k} /> : <Tree key={i} x={tx} k={k} />);
    if (i % 2 === 0) trees.push(<Bush key={`b${i}`} x={tx + 46 + rnd(i, 41) * 30} />);
  }
  const waves = [];
  if (sea) {
    for (let x = sea.x + 60, i = 0; x < layout.width + 200; x += 110, i++) {
      waves.push(
        <path key={i} d={`M${map(x)} ${[500, 540, 520][i % 3]} q8 -6 16 0 q8 6 16 0`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={2.4} fill="none" strokeLinecap="round" />,
      );
    }
  }
  return (
    <g aria-hidden>
      {trees}
      {waves.length > 0 && <g className={styles.wave}>{waves}</g>}
    </g>
  );
}

function Tree({ x, k }: { x: number; k: number }) {
  return (
    <g transform={`translate(${x} 528) scale(${k})`}>
      <ellipse cx={0} cy={0} rx={20} ry={5} fill="#1d5e24" opacity={0.3} />
      <path d="M-4 0 C -3 -12, -4 -22, -3 -30 L 3 -30 C 4 -22, 3 -12, 4 0 Z" fill="#8a5431" />
      <g filter="url(#lift)" fill="url(#leaf)">
        <circle cx={-12} cy={-40} r={16} />
        <circle cx={12} cy={-42} r={17} />
        <circle cx={0} cy={-58} r={19} />
      </g>
      <ellipse cx={-6} cy={-64} rx={7} ry={4.6} fill="#ffffff" opacity={0.22} />
    </g>
  );
}

function Conifer({ x, k }: { x: number; k: number }) {
  return (
    <g transform={`translate(${x} 528) scale(${k})`}>
      <ellipse cx={0} cy={0} rx={16} ry={4.4} fill="#1d5e24" opacity={0.3} />
      <rect x={-3} y={-14} width={6} height={14} rx={2} fill="#7a4a28" />
      <g filter="url(#lift)">
        <path d="M-20 -12 L0 -44 L20 -12 Z" fill="#2f9a4a" />
        <path d="M-16 -32 L0 -62 L16 -32 Z" fill="#3fb25a" />
        <path d="M-11 -50 L0 -76 L11 -50 Z" fill="#5ccb6c" />
      </g>
      <path d="M0 -76 L-11 -50 L-4 -52 Z" fill="#ffffff" opacity={0.18} />
    </g>
  );
}

function Bush({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 534)`}>
      <ellipse cx={0} cy={0} rx={18} ry={4} fill="#1d5e24" opacity={0.25} />
      <g fill="url(#leaf)">
        <circle cx={-9} cy={-6} r={8} />
        <circle cx={8} cy={-6} r={8.5} />
        <circle cx={0} cy={-11} r={9.5} />
      </g>
      <circle cx={-4} cy={-9} r={1.8} fill="#ff6b8a" />
      <circle cx={5} cy={-12} r={1.8} fill="#ffffff" />
      <circle cx={9} cy={-5} r={1.8} fill="#ff6b8a" />
    </g>
  );
}

/** The plane crosses its lane over the away zone; dashed while Brussels Airport is only known. */
export function Plane({ layout, vw, flat, ghost }: LayerProps & { ghost: boolean }) {
  const map = at(PARALLAX.plane, vw, flat);
  const { sea, away } = landmarks(layout);
  if (!away) return null;
  const from = map((sea?.x ?? away.x0) - 200);
  const to = map(away.x1 + 300);
  return (
    <g className={ghost ? `${styles.ghost} ${styles.breathe}` : undefined}>
      <g className={styles.plane} style={vars({ '--from': `${from}px`, '--to': `${to}px`, '--park': `${(from + to) / 2}px` })}>
        <g transform="translate(0 132)" filter="url(#lift)">
          <path d="M0 0 C 0 -6, 6 -9, 14 -9 L 70 -9 C 80 -9, 88 -5, 92 0 C 88 5, 80 8, 70 8 L 14 8 C 6 8, 0 5, 0 0 Z" fill="#ffffff" />
          <path d="M6 -8 L 0 -26 L 10 -26 L 22 -8 Z" fill="#0b2c5a" />
          <path d="M40 -4 L 30 -30 L 40 -30 L 58 -4 Z" fill="#dfe7f1" />
          <path d="M40 4 L 32 22 L 42 22 L 56 4 Z" fill="#c9d5e3" />
          {[24, 32, 40, 48, 56, 64].map((x) => (
            <circle key={x} cx={x} cy={-2} r={1.8} fill="#7cc8f0" />
          ))}
          <path d="M78 -6 C 84 -6, 88 -3, 90 0 L 80 0 Z" fill="#7cc8f0" />
        </g>
      </g>
    </g>
  );
}
