// MOBILITEIT: electric car with charging pole.

export function Auto() {
  return (
    <>
      <ellipse cx="246" cy="222" rx="42" ry="8" fill="#1d5e24" opacity=".4" filter="url(#soft)" />
      <rect x="286" y="188" width="10" height="30" rx="4" fill="#f4f7fb" filter="url(#lift)" />
      <rect x="288" y="193" width="6" height="6" rx="2" fill="#35d07f" />
      <path d="M291 206 C 288 222, 270 216, 272 206" stroke="#243449" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <g filter="url(#lift)">
        <path
          d="M212 212 C 212 200, 220 196, 232 195 L 238 184 C 241 180, 245 178, 252 178 L 266 178 C 272 178, 276 181, 279 186 L 284 196 C 290 198, 292 203, 292 212 C 292 216, 289 218, 285 218 L 218 218 C 214 218, 212 216, 212 212 Z"
          fill="url(#carBody)"
        />
        <path d="M240 194 L 246 184 C 247 182, 249 181, 252 181 L 258 181 L 258 194 Z" fill="#cfefff" />
        <path d="M262 194 L 262 181 L 267 181 C 270 181, 272 182, 274 185 L 278 194 Z" fill="#a8dcff" />
        <path d="M222 200 L 282 200" stroke="#fff" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
        <circle cx="287" cy="206" r="2.5" fill="#fff6c4" />
        <circle cx="230" cy="218" r="8" fill="#1b2433" />
        <circle cx="230" cy="218" r="3.5" fill="#c7d3e0" />
        <circle cx="274" cy="218" r="8" fill="#1b2433" />
        <circle cx="274" cy="218" r="3.5" fill="#c7d3e0" />
      </g>
    </>
  );
}
