// WONEN: house with solar panels.

export function Huis() {
  return (
    <>
      <ellipse cx="116" cy="166" rx="46" ry="11" fill="#1d5e24" opacity=".35" filter="url(#soft)" />
      <g filter="url(#lift)">
        <path d="M78 118 L118 118 L118 164 L78 164 Z" fill="url(#wall)" />
        <path d="M118 118 L152 108 L152 152 L118 164 Z" fill="url(#wallSide)" />
        <path d="M72 122 L98 90 L124 122 Z" fill="#c43f22" />
        <path d="M98 90 L136 78 L158 110 L124 122 Z" fill="url(#roof)" />
        <path d="M98 90 L136 78" stroke="#ffb199" strokeWidth="3" strokeLinecap="round" />
        <g>
          <path d="M112 99 L132 92 L144 108 L124 115 Z" fill="url(#panel)" />
          <path
            d="M118 97 L130 112 M125 94 L137 110 M114 104 L136 97 M119 110 L141 103"
            stroke="#a9c3ff"
            strokeWidth=".8"
            opacity=".7"
          />
          <path d="M114 100 L130 94" stroke="#fff" strokeWidth="1.5" opacity=".6" />
        </g>
        <rect x="138" y="72" width="8" height="18" rx="2" fill="#b0452b" />
        <rect x="92" y="140" width="13" height="24" rx="6" fill="#0a5fb4" />
        <circle cx="102" cy="153" r="1.4" fill="#ffd34d" />
        <rect x="82" y="128" width="8" height="9" rx="2" fill="url(#win)" />
        <path d="M126 130 L140 126 L140 138 L126 142 Z" fill="url(#win)" />
        <path d="M78 164 L118 164 L152 152" stroke="#000" strokeOpacity=".08" strokeWidth="2" fill="none" />
      </g>
    </>
  );
}
