// stock-exchange: a glass-and-stone exchange with a ticker board running across it and a bronze bull out front.
// The partner (Bolero) paints the roof slab, the door and the sign.

import { BrandSign, textWidth } from '../../scene/Badges';
import { labelFont } from '../../scene/font';
import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

const L = 14;
const R = 120;

export const stockExchangeTop = (signs: number) => (signs ? 262 : 288);
export const STOCK_EXCHANGE_FLAG = { x: R - 4, y: 292 };

/** Index quotes for the ticker: decoration, not market data. */
const QUOTES: [string, string, boolean][] = [
  ['BEL20', '+1,2%', true],
  ['AEX', '+0,4%', true],
  ['CAC', '−0,3%', false],
  ['DAX', '+0,9%', true],
];
const TICKER_SIZE = 8;
const RUN = QUOTES.reduce((w, [name, value]) => w + textWidth(`${name} ${value}  ·  `, TICKER_SIZE), 0);

function Quotes({ x }: { x: number }) {
  return (
    // white-space: pre keeps the gap at the seam between two runs; a dot marks it where it isn't supported.
    <text x={x} y={387.6} fontSize={TICKER_SIZE} textLength={RUN} lengthAdjust="spacing" style={{ whiteSpace: 'pre' }} {...labelFont}>
      {QUOTES.map(([name, value, up]) => (
        <tspan key={name}>
          <tspan fill="#cfe3f6">{name} </tspan>
          <tspan fill={up ? '#4ee08e' : '#ff7b7b'}>{value}</tspan>
          <tspan fill="#5f7899">{'  ·  '}</tspan>
        </tspan>
      ))}
    </text>
  );
}

export function StockExchange({ width, brands }: AvatarProps) {
  const brand = brands[0];
  const primary = brand?.colors.primary ?? '#00264d';
  const secondary = brand?.colors.secondary ?? '#00b5e2';
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={7} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <defs>
        <clipPath id="tickerBoard">
          <rect x={21} y={378} width={92} height={13} />
        </clipPath>
      </defs>
      <g filter="url(#lift)">
        {/* side */}
        <path d={`M${R} 300 L${R + 12} 294 L${R + 12} 367 L${R} 372 Z`} fill="#5aa7d6" />
        <path d={`M${R} 372 L${R + 12} 367 L${R + 12} 414 L${R} 420 Z`} fill="url(#stoneSide)" />
        {/* glass upper floors */}
        <rect x={L} y={300} width={R - L} height={72} fill="url(#glass)" />
        <path
          d={`${Array.from({ length: 6 }, (_, i) => `M${L + (i + 1) * 15.1} 300 V372`).join(' ')} M${L} 324 H${R} M${L} 348 H${R}`}
          stroke="#ffffff"
          strokeOpacity={0.6}
          strokeWidth={1.3}
        />
        <path d={`M${L + 10} 300 L${L + 26} 300 L${L + 6} 372 L${L} 372 L${L} 340 Z`} fill="#ffffff" opacity={0.28} />
        <path d={`M${L + 58} 300 L${L + 66} 300 L${L + 48} 372 L${L + 40} 372 Z`} fill="#ffffff" opacity={0.18} />
        {/* stone base */}
        <rect x={L} y={372} width={R - L} height={48} fill="url(#stone)" />
        {/* roof slab */}
        <path d={`M${L - 4} 294 L${L + 8} 288 L${R + 16} 288 L${R + 4} 294 Z`} fill={primary} />
        <path d={`M${L - 4} 294 L${L + 8} 288 L${R + 16} 288 L${R + 4} 294 Z`} fill="#ffffff" opacity={0.3} />
        <rect x={L - 4} y={294} width={R - L + 8} height={8} fill={primary} />
        <path d={`M${R + 4} 294 L${R + 16} 288 L${R + 16} 296 L${R + 4} 302 Z`} fill={primary} />
        <path d={`M${R + 4} 294 L${R + 16} 288 L${R + 16} 296 L${R + 4} 302 Z`} fill="#000000" opacity={0.25} />
        <rect x={L - 4} y={300.5} width={R - L + 8} height={1.6} fill={secondary} />
        {/* ticker board */}
        <rect x={18} y={376} width={98} height={17} rx={3} fill="#0b1a2e" />
        {/* entrance */}
        <rect x={52} y={394} width={30} height={3} rx={1} fill={primary} />
        <rect x={56} y={397} width={22} height={23} fill="url(#glass)" stroke={primary} strokeWidth={2} />
        <path d="M67 397 V420" stroke={primary} strokeWidth={1.4} />
        {/* the bull on its plinth */}
        <rect x={2} y={412} width={30} height={8} rx={1.5} fill="url(#stone)" />
        <g fill="url(#bronze)">
          <rect x={8} y={404} width={2.8} height={8} rx={1} />
          <rect x={12.5} y={405} width={2.8} height={7} rx={1} />
          <rect x={20} y={405} width={2.8} height={7} rx={1} />
          <rect x={24.5} y={404} width={2.8} height={8} rx={1} />
          <ellipse cx={17} cy={402} rx={11} ry={6} />
          <path d="M26 398 C 30 396, 33 398, 33 402 C 33 405, 30 406, 28 405 Z" />
        </g>
        <path d="M27.5 397.5 C 27 393, 24.5 392, 22.5 392.5 M30.5 397.5 C 32 394, 35 393.5, 36.5 394.5" stroke="#8a5a2b" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <path d="M6.5 400 C 3 401, 2.5 404, 3.5 407" stroke="#8a5a2b" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        <ellipse cx={14} cy={399} rx={5} ry={1.6} fill="#ffffff" opacity={0.3} />
      </g>
      {/* the ticker runs outside the shadowed group, clipped to its board */}
      <g clipPath="url(#tickerBoard)" className={styles.sign}>
        <g className={styles.ticker} style={{ '--run': `${-RUN}px` } as object}>
          <Quotes x={22} />
          <Quotes x={22 + RUN} />
        </g>
      </g>
      {brand && (
        <>
          <rect x={52} y={280} width={3} height={9} fill="#5a6b82" />
          <rect x={80} y={280} width={3} height={9} fill="#5a6b82" />
          <BrandSign brand={brand} cx={67.5} y={262} size={11} minWidth={52} />
        </>
      )}
    </>
  );
}
