'use dom';

// The customer's world as a horizontal street (D1), one Expo DOM component (D8): on web it renders inline,
// on iOS/Android in a lightweight webview. Props are JSON; the on* props are async native actions.
// The page scroll stays native; the street scrolls horizontally inside its own overflow container.
//
// Opening: the fly-in (4.7) holds on the clouds while the world loads, then circles down onto the household.
// After it, new places arrive one by one (4.8) and are reported back with onArrivalsDone.

import { useDOMImperativeHandle, type DOMImperativeFactory } from 'expo/dom';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react';

import { ZONE_LABELS } from './categories';
import { layoutWorld, PARALLAX, WORLD_H, type PositionedPlace } from './layout';
import { Place, type ArrivalPhase } from './Place';
import { BackLayer, Clouds, FarLayer, Foreground, Ground, Plane } from './scene/Backdrop';
import { SceneDefs } from './scene/Defs';
import { FLY_CLOUDS, FlyClouds, PART, partVector } from './scene/FlyClouds';
import { IN_NATIVE_WEBVIEW } from './scene/font';
import styles from './street.module.css';
import type { WorldView, ZoneId } from './types';

/** Arguments cross the bridge as JSON. */
type Json = Parameters<DOMImperativeFactory[string]>[number];

export interface StreetHandle extends DOMImperativeFactory {
  scrollToPlace: (id: Json) => void;
  scrollToZone: (zone: Json) => void;
  skipFlyIn: () => void;
}

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@700&display=swap';
const FLY_MS = 3000;
const EASE = 'cubic-bezier(.45,0,.2,1)';
const OVERSHOOT = 'cubic-bezier(.2,.9,.3,1.1)';
/** At most this many arrivals play one by one; the rest land together (R5). */
const FULL_ARRIVALS = 3;

/** Camera keyframes from 4.7, in world units; the content moves opposite to the camera. */
const CAMERA = [
  { t: 0, x: 0, y: -520, s: 0.6, r: -8, easing: EASE },
  { t: 0.8, x: 220, y: -180, s: 0.55, r: -10, easing: EASE },
  { t: 1.5, x: 120, y: -40, s: 0.8, r: 6, easing: EASE },
  { t: 2.2, x: 0, y: 30, s: 1.8, r: 0, easing: OVERSHOOT },
  { t: 3.0, x: 0, y: 0, s: 1, r: 0, easing: 'linear' },
];
const cameraTransform = (k: (typeof CAMERA)[number], scale: number) =>
  `translate(${-k.x * scale}px, ${-k.y * scale}px) scale(${k.s}) rotate(${k.r}deg)`;

/** Clouds rush past with growing speed, as if the camera dives through them. */
const PART_EASE = 'cubic-bezier(.45,0,.85,.4)';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Street({
  ref,
  world,
  height,
  flyInKey,
  reducedMotion,
  onSelectPlace,
  onSelectAttachment,
  onFlyInDone,
  onArrivalsDone,
  onZoneChange,
}: {
  ref?: Ref<StreetHandle>;
  /** null while loading: the fly-in holds on the clouds. */
  world: WorldView | null;
  /** Band height in px; the world's 600 units scale to it. */
  height: number;
  /** Bumped on every screen focus: a change restarts the fly-in. */
  flyInKey: number;
  reducedMotion: boolean;
  onSelectPlace: (id: string) => Promise<void> | void;
  onSelectAttachment: (placeId: string, partnerId: string) => Promise<void> | void;
  onFlyInDone: () => Promise<void> | void;
  onArrivalsDone: (ids: string[]) => Promise<void> | void;
  onZoneChange: (zone: string) => Promise<void> | void;
  dom?: import('expo/dom').DOMProps;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const cloudLayer = useRef<SVGGElement>(null);
  const farLayer = useRef<SVGGElement>(null);
  const planeLayer = useRef<SVGGElement>(null);
  const backLayer = useRef<SVGGElement>(null);
  const foreLayer = useRef<SVGGElement>(null);

  const [viewport, setViewport] = useState(() => (typeof window === 'undefined' ? 390 : window.innerWidth));
  const [mediaReduced, setMediaReduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
  const reduced = reducedMotion || mediaReduced;
  const scale = height / WORLD_H;
  const vw = viewport / scale;

  // ---- Environment ----

  useEffect(() => {
    if (!IN_NATIVE_WEBVIEW) return;
    document.body.style.margin = '0';
    document.body.style.background = 'transparent';
    document.body.style.overflow = 'hidden';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_CSS;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const on = (e: MediaQueryListEvent) => setMediaReduced(e.matches);
    query.addEventListener?.('change', on);
    return () => query.removeEventListener?.('change', on);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Fires once right away, then on every resize.
    const observer = new ResizeObserver(() => setViewport(root.clientWidth || window.innerWidth));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Idle loops stop while the world is scrolled out of view (on web; a native webview is always "in view").
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // ---- Layout, departures ----

  const places = useMemo(() => world?.places ?? [], [world]);
  const layout = useMemo(() => layoutWorld(places, vw), [places, vw]);
  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  // Compared with the previous world: places that left fade out where they were (300ms), and a new place
  // that was a plot keeps showing the plot until it sinks.
  const [previous, setPrevious] = useState({ layout, places });
  const [leaving, setLeaving] = useState<PositionedPlace[]>([]);
  const [fromPlot, setFromPlot] = useState<Record<string, string>>({});
  /** Places whose arrival has played on this screen. */
  const [played, setPlayed] = useState<string[]>([]);
  if (previous.layout !== layout || previous.places !== places) {
    const gone = previous.layout.items.filter((i) => !layout.items.some((n) => n.place.id === i.place.id));
    const grown: Record<string, string> = {};
    for (const p of places) {
      const before = previous.places.find((x) => x.id === p.id);
      if (p.isNew && !played.includes(p.id) && before?.state === 'plot' && !(p.id in fromPlot)) {
        grown[p.id] = before.plotName ?? before.label;
      }
    }
    setPrevious({ layout, places });
    if (gone.length) setLeaving((l) => [...l.filter((i) => !gone.some((g) => g.place.id === i.place.id)), ...gone]);
    if (Object.keys(grown).length) setFromPlot((f) => ({ ...f, ...grown }));
  }
  useEffect(() => {
    if (!leaving.length) return;
    const timer = setTimeout(() => setLeaving([]), 320);
    return () => clearTimeout(timer);
  }, [leaving]);

  // ---- Scrolling, parallax, zones ----

  const [zone, setZone] = useState<ZoneId>('home');
  const zoneRef = useRef<ZoneId>('home');
  const frame = useRef(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const s = scroller.scrollLeft / scale;
      if (!reduced) {
        const shift = (g: SVGGElement | null, f: number) => g?.setAttribute('transform', `translate(${s * (1 - f)} 0)`);
        shift(cloudLayer.current, PARALLAX.clouds);
        shift(farLayer.current, PARALLAX.far);
        shift(planeLayer.current, PARALLAX.plane);
        shift(backLayer.current, PARALLAX.back);
        shift(foreLayer.current, PARALLAX.foreground);
      }
      const centre = s + vw / 2;
      const zones = layoutRef.current.zones;
      const current =
        zones.find((z) => centre >= z.x0 && centre <= z.x1) ??
        [...zones].sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - centre) - Math.abs((b.x0 + b.x1) / 2 - centre))[0];
      if (current && current.id !== zoneRef.current) {
        zoneRef.current = current.id;
        setZone(current.id);
        onZoneChange(current.id);
      }
    });
  }, [scale, vw, reduced, onZoneChange]);

  useEffect(onScroll, [onScroll, layout]);

  const scrollTo = useCallback(
    (left: number, smooth: boolean) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const max = scroller.scrollWidth - scroller.clientWidth;
      scroller.scrollTo({ left: Math.max(0, Math.min(max, left)), behavior: smooth && !reduced ? 'smooth' : 'auto' });
    },
    [reduced],
  );

  const scrollToPlace = useCallback(
    (id: string, smooth = true) => {
      const item = layoutRef.current.items.find((i) => i.place.id === id);
      if (item) scrollTo((item.x + item.width / 2) * scale - viewport / 2, smooth);
    },
    [scale, viewport, scrollTo],
  );

  const scrollToZone = useCallback(
    (id: string) => {
      const z = layoutRef.current.zones.find((x) => x.id === id);
      if (z) scrollTo(z.x0 * scale, true);
    },
    [scale, scrollTo],
  );

  // Desktop (phone frame): drag the street with the mouse. Touch scrolls natively.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !scrollerRef.current) return;
    drag.current = { x: e.clientX, left: scrollerRef.current.scrollLeft, moved: false };
    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d || !scrollerRef.current) return;
      const dx = ev.clientX - d.x;
      if (Math.abs(dx) > 4 && !d.moved) {
        d.moved = true;
        setDragging(true);
      }
      if (d.moved) scrollerRef.current.scrollLeft = d.left - dx;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDragging(false);
      // Let the click that ends a drag pass first, then forget the drag.
      setTimeout(() => (drag.current = null), 0);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const onClickCapture = (e: ReactMouseEvent) => {
    if (drag.current?.moved) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // ---- Fly-in ----

  // Flying until this flyInKey has landed: a new key starts over from the sky.
  const [landedKey, setLandedKey] = useState<number | null>(null);
  const [waveKey, setWaveKey] = useState<number | null>(null);
  const flying = landedKey !== flyInKey;
  const wave = waveKey === flyInKey;
  const animations = useRef<Animation[]>([]);
  const started = useRef(false);
  /** The household waves near the end of the flight; owned by the flight, not by the effect that starts it. */
  const waveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const household = layout.items.find((i) => i.place.id === 'household');
  const origin = household
    ? `${(household.x + household.width / 2) * scale}px ${380 * scale}px`
    : `${(vw / 2) * scale}px ${380 * scale}px`;

  // Every flyInKey starts over from the sky.
  useLayoutEffect(() => {
    animations.current.forEach((a) => a.cancel());
    animations.current = [];
    started.current = false;
    clearTimeout(waveTimer.current);
    const camera = cameraRef.current;
    if (camera) {
      camera.style.transform = reduced ? 'none' : cameraTransform(CAMERA[0], scale);
      camera.style.opacity = reduced ? '0' : '1';
    }
    scrollerRef.current?.scrollTo({ left: 0 });
    // Only the key restarts it; scale and motion settings are read as they are now.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyInKey]);

  const land = useCallback(() => {
    animations.current.forEach((a) => a.cancel());
    animations.current = [];
    const camera = cameraRef.current;
    if (camera) {
      camera.style.transform = 'none';
      camera.style.opacity = '1';
    }
    setLandedKey(flyInKey);
    onFlyInDone();
  }, [flyInKey, onFlyInDone]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!world || !flying || started.current || !camera) return;
    started.current = true;

    if (reduced) {
      const fade = camera.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
      animations.current = [fade];
      fade.finished.then(land, () => {});
      return;
    }

    camera.style.transformOrigin = origin;
    const fly = camera.animate(
      CAMERA.map((k) => ({ offset: k.t / 3, transform: cameraTransform(k, scale), easing: k.easing })),
      { duration: FLY_MS, fill: 'forwards' },
    );
    // The cloud bank parts outward from the centre; the haze clears first, and sunlight floods in behind it.
    const bank = cloudsRef.current;
    const ratio = bank ? bank.clientWidth / Math.max(1, bank.clientHeight) : 0.6;
    const clouds = [...(bank?.querySelectorAll<HTMLElement>('[data-cloud]') ?? [])].map((el) => {
      const c = FLY_CLOUDS[Number(el.dataset.cloud)];
      const { delay, duration, scale: grow, hold } = PART[c.depth];
      const out = partVector(c, ratio);
      const from = Number(el.style.opacity || 1);
      return el.animate(
        [
          { transform: 'translate(0, 0) scale(1)', opacity: from },
          { opacity: from, offset: hold },
          { transform: `translate(${out.x}%, ${out.y}%) scale(${grow})`, opacity: 0 },
        ],
        { duration, delay, easing: PART_EASE, fill: 'forwards' },
      );
    });
    const haze = bank?.querySelector<HTMLElement>('[data-haze]');
    const hazeOut = haze?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
    const flash = flashRef.current?.animate(
      [{ opacity: 0 }, { opacity: 0.75, offset: 0.35 }, { opacity: 0 }],
      { duration: 1500, delay: 380, easing: 'ease-in-out', fill: 'forwards' },
    );
    animations.current = [fly, ...clouds, ...(hazeOut ? [hazeOut] : []), ...(flash ? [flash] : [])];
    // Not cleared when this effect re-runs mid-flight (a new prop, a poll): the flight has already started then.
    waveTimer.current = setTimeout(() => setWaveKey(flyInKey), 2100);
    fly.finished.then(land, () => {});
  }, [world, flying, reduced, origin, scale, land, flyInKey]);

  useEffect(() => () => clearTimeout(waveTimer.current), []);

  const skipFlyIn = useCallback(() => {
    if (flying && started.current) animations.current.forEach((a) => a.finish());
  }, [flying]);

  // ---- Arrivals ----

  const [phases, setPhases] = useState<Record<string, ArrivalPhase>>({});
  const [arrivalTick, setArrivalTick] = useState(0);
  const running = useRef(false);
  const setPhase = (ids: string[], phase: ArrivalPhase | null) =>
    setPhases((p) => {
      const next = { ...p };
      for (const id of ids) {
        if (phase) next[id] = phase;
        else delete next[id];
      }
      return next;
    });

  useEffect(() => {
    if (flying || running.current) return;
    const queue = places.filter((p) => p.isNew && !played.includes(p.id)).map((p) => p.id);
    if (!queue.length) return;
    running.current = true;
    (async () => {
      const motion = (ms: number) => wait(reduced ? 0 : ms);
      for (const id of queue.slice(0, FULL_ARRIVALS)) {
        scrollToPlace(id);
        await motion(650);
        if (id in fromPlot) {
          setPhase([id], 'sinking');
          await motion(250);
        }
        setPhase([id], 'arriving');
        await motion(900);
        setPlayed((p) => [...p, id]);
        setPhase([id], null);
        onArrivalsDone([id]);
        await motion(600);
      }
      const rest = queue.slice(FULL_ARRIVALS);
      if (rest.length) {
        setPhase(rest, 'arriving');
        await motion(900);
        setPlayed((p) => [...p, ...rest]);
        setPhase(rest, null);
        onArrivalsDone(rest);
      }
      running.current = false;
      setArrivalTick((t) => t + 1);
    })();
    // A run reads the places it started with; arrivalTick re-checks the queue once it's done.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, flying, arrivalTick]);

  // ---- Native handle ----

  useDOMImperativeHandle(
    ref as Ref<StreetHandle>,
    () => ({
      scrollToPlace: (id) => scrollToPlace(String(id)),
      scrollToZone: (id) => scrollToZone(String(id)),
      skipFlyIn: () => skipFlyIn(),
    }),
    [scrollToPlace, scrollToZone, skipFlyIn],
  );

  // ---- Render ----

  const airport = places.find((p) => p.id === 'airport');
  const neighbourhood = layout.zones.find((z) => z.id === 'neighbourhood');
  const busStop = places.some((p) => p.id === 'bus-stop');
  const items = [...layout.items, ...leaving];
  const names = world?.household.names.join(' en ') ?? '';

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${reduced ? styles.reduced : ''} ${offscreen ? styles.paused : ''}`}
      style={{ height }}
      onPointerDownCapture={flying ? skipFlyIn : undefined}>
      <div className={styles.sky} />
      <div className={styles.sunGlow} />
      <div className={styles.sunRays} />
      <div className={styles.sun} />
      <div
        ref={scrollerRef}
        className={`${styles.scroller} ${flying ? styles.locked : ''} ${dragging ? styles.dragging : ''}`}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}>
        <div ref={cameraRef} className={styles.camera} style={{ width: layout.width * scale, height }}>
          {world && (
            <svg
              width={layout.width * scale}
              height={height}
              viewBox={`0 0 ${layout.width} ${WORLD_H}`}
              role="group"
              aria-label={`De wereld van ${names}`}>
              <SceneDefs />
              <g ref={cloudLayer}>
                <Clouds layout={layout} vw={vw} flat={reduced} />
              </g>
              <g ref={farLayer}>
                <FarLayer layout={layout} vw={vw} flat={reduced} />
              </g>
              <g ref={planeLayer}>{airport && <Plane layout={layout} vw={vw} flat={reduced} ghost={airport.state === 'ghost'} />}</g>
              <g ref={backLayer}>
                <BackLayer layout={layout} vw={vw} flat={reduced} />
              </g>
              <Ground
                layout={layout}
                busFrom={busStop && neighbourhood ? neighbourhood.x0 - 200 : undefined}
                busTo={busStop && neighbourhood ? neighbourhood.x1 + 200 : undefined}
              />
              {items.map((item) => {
                const id = item.place.id;
                const isLeaving = leaving.includes(item);
                const isNew = item.place.isNew && !played.includes(id);
                return (
                  <Place
                    key={isLeaving ? `${id}-leaving` : id}
                    item={item}
                    household={world.household}
                    phase={isNew ? (phases[id] ?? 'pending') : undefined}
                    fromPlot={isNew ? fromPlot[id] : undefined}
                    leaving={isLeaving}
                    locked={flying || isLeaving}
                    wave={wave && id === 'household'}
                    onSelect={(placeId) => onSelectPlace(placeId)}
                    onSelectAttachment={(placeId, partnerId) => onSelectAttachment(placeId, partnerId)}
                  />
                );
              })}
              <g ref={foreLayer}>
                <Foreground layout={layout} vw={vw} flat={reduced} />
              </g>
            </svg>
          )}
        </div>
      </div>

      {flying && !reduced && <FlyClouds cloudsRef={cloudsRef} />}
      {!reduced && <div ref={flashRef} className={styles.sunFlash} aria-hidden />}

      {world && !flying && layout.zones.length > 1 && (
        <nav className={styles.zones} aria-label="Zones">
          {layout.zones.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`${styles.zone} ${z.id === zone ? styles.zoneActive : ''}`}
              aria-current={z.id === zone ? 'location' : undefined}
              onClick={() => scrollToZone(z.id)}>
              {ZONE_LABELS[z.id]}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
