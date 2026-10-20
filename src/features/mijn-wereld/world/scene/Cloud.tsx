// A cartoon cumulus: overlapping puffs, each shaded top to bottom, over a bluish underside, with highlights on
// the upper puffs. No filters, so clouds stay cheap to move. Drawn around (0, 0), about 180 × 95 units.

export type CloudShapeId = 'a' | 'b' | 'c';

/** Puffs as [cx, cy, r]; the flat base is drawn separately. */
const PUFFS: Record<CloudShapeId, [number, number, number][]> = {
  a: [[-62, 8, 24], [-34, -8, 31], [2, -24, 38], [40, -8, 30], [68, 8, 22], [-14, 10, 28], [24, 10, 28]],
  b: [[-56, 10, 22], [-26, -12, 32], [10, -34, 36], [44, -6, 30], [70, 12, 18], [6, 8, 30]],
  c: [[-76, 12, 18], [-48, 0, 26], [-14, -14, 30], [22, -8, 29], [54, 2, 24], [80, 12, 15], [-20, 12, 26], [24, 14, 24]],
};

/** The viewBox that fits every shape, for clouds drawn in their own <svg>. */
export const CLOUD_VIEWBOX = '-100 -76 200 116';

export function CloudShape({ shape, body = 'cloudBody', shade = '#c9dcef' }: { shape: CloudShapeId; body?: string; shade?: string }) {
  const puffs = PUFFS[shape];
  const [minX, maxX] = [Math.min(...puffs.map(([x, , r]) => x - r)), Math.max(...puffs.map(([x, , r]) => x + r))];
  const baseRx = (maxX - minX) / 2 - 10;
  const baseCx = (maxX + minX) / 2;
  return (
    <>
      <g fill={shade}>
        <ellipse cx={baseCx} cy={24} rx={baseRx} ry={12} />
        {puffs.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y + 6} r={r} />
        ))}
      </g>
      <g fill={`url(#${body})`}>
        <ellipse cx={baseCx} cy={19} rx={baseRx} ry={12} />
        {puffs.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill="#ffffff">
        {puffs
          .filter(([, y]) => y < 0)
          .map(([x, y, r], i) => (
            <ellipse key={i} cx={x - r * 0.24} cy={y - r * 0.34} rx={r * 0.5} ry={r * 0.36} opacity={0.9} />
          ))}
      </g>
    </>
  );
}
