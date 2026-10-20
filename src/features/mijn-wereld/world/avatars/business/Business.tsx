// business: the customer's own company. A two-storey office with a shop front, someone at work inside,
// solar panels on the roof. Without a partner sign it carries its label ("Mijn zaak") on the facade.

import { BrandSign } from '../../scene/Badges';
import { labelFont } from '../../scene/font';
import styles from '../../street.module.css';
import type { AvatarProps } from '../types';

const L = 10;
const R = 150;
const ACCENT = '#12a594';

export const BUSINESS_TOP = 298;
export const BUSINESS_FLAG = { x: 22, y: 312 };

export function Business({ width, label, brands }: AvatarProps) {
  const brand = brands[0];
  const signW = Math.max(64, label.length * 6.4 + 22);
  return (
    <>
      <ellipse cx={width / 2} cy={420} rx={width / 2} ry={7} fill="#1d5e24" opacity=".3" filter="url(#soft)" />
      <g filter="url(#lift)">
        {/* roof: units and solar panels */}
        <rect x={26} y={300} width={18} height={12} rx={2} fill="#c9d5e3" />
        <rect x={29} y={303} width={12} height={2} fill="#9aa8b8" />
        <rect x={50} y={304} width={12} height={8} rx={2} fill="#dfe7f1" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${92 + i * 17} 312 L${96 + i * 17} 301 L${110 + i * 17} 301 L${106 + i * 17} 312 Z`} fill="url(#panel)" />
        ))}
        <path d={`M${R} 314 L${R + 14} 308 L${R + 14} 414 L${R} 420 Z`} fill="url(#stoneSide)" />
        <rect x={L - 2} y={310} width={R - L + 4} height={5} rx={1} fill="#dfe7f1" />
        {/* upper floor: a band of windows, one with the blinds half down */}
        <rect x={L} y={314} width={R - L} height={58} fill="url(#stone)" />
        {[0, 1, 2, 3].map((i) => {
          const x = 20 + i * 32;
          return (
            <g key={i}>
              <rect x={x} y={322} width={26} height={26} rx={2} fill={i === 2 ? 'url(#win)' : 'url(#glass)'} />
              {i === 1 && (
                <g>
                  <rect x={x} y={322} width={26} height={12} fill="#f4f7fb" />
                  <path d={`M${x} 326 H${x + 26} M${x} 330 H${x + 26}`} stroke="#c9d5e3" strokeWidth={0.8} />
                </g>
              )}
              <rect x={x} y={322} width={26} height={26} rx={2} fill="none" stroke="#ffffff" strokeWidth={1.8} />
            </g>
          );
        })}
        {/* ground floor: canopy, shop window with someone at work, door, plants */}
        <rect x={L} y={372} width={R - L} height={48} fill="#2b3a55" />
        <rect x={L - 2} y={370} width={R - L + 4} height={8} rx={1.5} fill={ACCENT} />
        <rect x={L} y={378} width={R - L} height={2.4} fill="#000000" opacity={0.18} />
        <rect x={16} y={384} width={84} height={32} rx={1.5} fill="url(#glass)" />
        <rect x={30} y={404} width={44} height={3.4} rx={1} fill="#c9935e" />
        <rect x={34} y={407} width={2.4} height={9} fill="#8a6a4a" />
        <rect x={68} y={407} width={2.4} height={9} fill="#8a6a4a" />
        <rect x={40} y={396} width={9} height={9} rx={3.4} fill="#ff8a66" />
        <circle cx={44.5} cy={392} r={3.6} fill="url(#skin)" />
        <path d="M41 391.5 a3.6 3.6 0 0 1 7 0 q-2 -1.4 -4 -0.6 z" fill="#3b2416" />
        <rect x={56} y={395} width={12} height={8.4} rx={1} fill="#7cc8f0" />
        <rect x={60} y={403} width={4} height={1.4} fill="#5a6b82" />
        <circle cx={88} cy={404} r={5} fill="#46c05c" />
        <rect x={85.6} y={408} width={4.8} height={6} rx={1} fill="#c86a4a" />
        <path d="M22 384 L30 384 L18 416 L16 416 L16 398 Z" fill="#ffffff" opacity={0.3} />
        <rect x={108} y={382} width={22} height={38} rx={1.5} fill="url(#glass)" stroke={ACCENT} strokeWidth={2} />
        <rect x={111} y={400} width={2} height={7} rx={1} fill="#ffffff" />
        <path d="M134 420 L135.5 410 H146.5 L148 420 Z" fill="#c86a4a" />
        <circle cx={141} cy={405} r={6.4} fill="url(#leaf)" />
      </g>
      {brand ? (
        <BrandSign brand={brand} cx={(L + R) / 2} y={350} size={11} />
      ) : (
        <g className={styles.sign}>
          <rect x={(L + R) / 2 - signW / 2} y={352} width={signW} height={16} rx={5} fill="#ffffff" stroke={ACCENT} strokeWidth={1.4} />
          <text x={(L + R) / 2} y={363.6} textAnchor="middle" fontSize={10} fill={ACCENT} {...labelFont}>
            {label}
          </text>
        </g>
      )}
    </>
  );
}
