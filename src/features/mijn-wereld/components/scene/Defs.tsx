// Gradients, filters and symbols, copied verbatim from mijn-wereld-prototype.html.

export function SceneDefs() {
  return (
    <defs>
      <radialGradient id="grass" cx="45%" cy="30%" r="75%">
        <stop offset="0" stopColor="#a6f07a" />
        <stop offset=".6" stopColor="#6fd052" />
        <stop offset="1" stopColor="#3fa33a" />
      </radialGradient>
      <linearGradient id="cliff" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d9955c" />
        <stop offset=".55" stopColor="#a8683b" />
        <stop offset="1" stopColor="#6e4024" />
      </linearGradient>
      <linearGradient id="cliffSide" x1="0" x2="1">
        <stop offset="0" stopColor="#000" stopOpacity=".22" />
        <stop offset=".35" stopColor="#000" stopOpacity="0" />
        <stop offset=".75" stopColor="#fff" stopOpacity=".08" />
        <stop offset="1" stopColor="#000" stopOpacity=".25" />
      </linearGradient>
      <linearGradient id="wall" x1="0" x2="1">
        <stop offset="0" stopColor="#fff7e8" />
        <stop offset="1" stopColor="#efcf9f" />
      </linearGradient>
      <linearGradient id="wallSide" x1="0" x2="1">
        <stop offset="0" stopColor="#e2b77e" />
        <stop offset="1" stopColor="#c9975c" />
      </linearGradient>
      <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff8a66" />
        <stop offset="1" stopColor="#d44a2c" />
      </linearGradient>
      <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5a7fd6" />
        <stop offset="1" stopColor="#1c2f66" />
      </linearGradient>
      <radialGradient id="win" cx="40%" cy="35%" r="70%">
        <stop offset="0" stopColor="#fff6c4" />
        <stop offset="1" stopColor="#ffc94a" />
      </radialGradient>
      <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4fb0ff" />
        <stop offset=".5" stopColor="#0a6fd1" />
        <stop offset="1" stopColor="#074a91" />
      </linearGradient>
      <radialGradient id="leaf" cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#9ff08c" />
        <stop offset=".6" stopColor="#46c05c" />
        <stop offset="1" stopColor="#23873e" />
      </radialGradient>
      <radialGradient id="coin" cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#fff3a8" />
        <stop offset=".55" stopColor="#ffc81a" />
        <stop offset="1" stopColor="#c98500" />
      </radialGradient>
      <radialGradient id="water" cx="40%" cy="35%" r="70%">
        <stop offset="0" stopColor="#b8f0ff" />
        <stop offset=".6" stopColor="#4cc3f0" />
        <stop offset="1" stopColor="#1c8fcf" />
      </radialGradient>
      <radialGradient id="kate" cx="35%" cy="28%" r="80%">
        <stop offset="0" stopColor="#bfe6ff" />
        <stop offset=".5" stopColor="#2f95f0" />
        <stop offset="1" stopColor="#0a4f9c" />
      </radialGradient>
      <radialGradient id="cloudG" cx="40%" cy="30%" r="80%">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#dcebf7" />
      </radialGradient>
      <radialGradient id="skin" cx="38%" cy="32%" r="75%">
        <stop offset="0" stopColor="#ffe2cc" />
        <stop offset="1" stopColor="#e9b08a" />
      </radialGradient>
      <linearGradient id="shirtT" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5aa9ff" />
        <stop offset="1" stopColor="#1f5fb0" />
      </linearGradient>
      <linearGradient id="shirtL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff9a7a" />
        <stop offset="1" stopColor="#d9573a" />
      </linearGradient>
      <linearGradient id="onesie" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff0a0" />
        <stop offset="1" stopColor="#f2c230" />
      </linearGradient>
      <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <filter id="lift" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodColor="#0b2a4a" floodOpacity=".22" />
      </filter>
      <symbol id="kateLogo" viewBox="-200 -200 400 400">
        <circle r="200" fill="#b3e0f5" />
        <circle r="184" fill="#e2f2fc" />
        <circle r="168" fill="#f1f8fe" />
        <circle r="152" fill="#fbfdff" />
        <g stroke="#009fe3" strokeWidth="22" strokeLinecap="round">
          <line x1="-29" y1="-85" x2="-3" y2="-85" />
          <line x1="-67" y1="-43" x2="11" y2="-43" />
          <line x1="-89" y1="0" x2="88" y2="0" />
          <line x1="-11" y1="42" x2="67" y2="42" />
          <line x1="2" y1="84" x2="28" y2="84" />
        </g>
      </symbol>
      <g id="check">
        <circle r="6.5" fill="#1f9d55" />
        <path
          d="M-2.8 0 l2 2 l3.8 -4"
          stroke="#fff"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </defs>
  );
}
