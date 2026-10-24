// ── Lobby illustration ────────────────────────────────────────────────────────
// A hotel lobby in single-weight line, drawn front-on along the floor of the footer:
//   left     an arched entrance and a luggage trolley stacked with cases
//   centre   the reception desk (banker's lamp, the guestbook, a desk bell, flowers),
//            the key cabinet behind it with room keys on their hooks, three lobby
//            clocks above, two pendant lamps
//   right    an armchair, a side table with a lamp, a potted plant and the stairs
// A little displacement gives the lines a hand-drawn wobble, so it sits with the
// sketched portrait in the hero. It's decoration only, drawn in currentColor.

const KEYS: [number, number][] = [
  [0, 0], [2, 0], [5, 0], [7, 0],
  [1, 1], [3, 1], [4, 1], [6, 1],
  [0, 2], [2, 2], [5, 2], [7, 2],
];

// Teardrop room fob on a hook, hanging from (x, y)
function Key({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y} v8 m0 0 q-6 7 0 14 q6 -7 0 -14`} />;
}

function Clock({ x, y, hour, minute }: { x: number; y: number; hour: number; minute: number }) {
  const hand = (turns: number, length: number) => {
    const a = turns * Math.PI * 2;
    return `M${x} ${y} L${(x + Math.sin(a) * length).toFixed(1)} ${(y - Math.cos(a) * length).toFixed(1)}`;
  };
  return (
    <g>
      <circle cx={x} cy={y} r="16" />
      <path d={`${hand(hour / 12, 8)} ${hand(minute / 60, 12)}`} />
    </g>
  );
}

function Leaf({ d }: { d: string }) {
  return <path d={d} />;
}

export default function LobbyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 400"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <filter id="lobby-wobble" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>

      <g filter="url(#lobby-wobble)">
        {/* Floor */}
        <path d="M0 380 L1440 380" />

        {/* ── Left: a framed picture over a bench ── */}
        <rect x="40" y="168" width="84" height="64" />
        <rect x="48" y="176" width="68" height="48" />
        <path d="M52 220 L72 196 L84 208 L98 188 L112 220" />
        <path d="M30 340 H134 M34 340 V380 M130 340 V380 M30 334 H134" />

        {/* ── Arched entrance ── */}
        <path d="M150 380 V196 A70 70 0 0 1 290 196 V380" />
        <path d="M160 380 V198 A60 60 0 0 1 280 198 V380" />
        <path d="M220 138 V380" />
        <path d="M160 236 H280 M160 300 H280" />
        <path d="M212 316 V332 M228 316 V332" />
        <path d="M168 198 A52 52 0 0 1 272 198" />

        {/* ── Luggage trolley ── */}
        <path d="M330 360 H430 V366 H330 Z" />
        <circle cx="342" cy="372" r="8" />
        <circle cx="418" cy="372" r="8" />
        <path d="M336 360 V252 M424 360 V252 M336 252 Q380 222 424 252" />
        <path d="M356 241 v6 M380 236 v6 M404 241 v6" />
        <rect x="344" y="300" width="72" height="60" rx="4" />
        <path d="M368 300 v-6 h24 v6 M360 300 V360 M400 300 V360" />
        <rect x="352" y="262" width="52" height="38" rx="4" />
        <path d="M370 262 v-5 h16 v5" />

        {/* ── Pendant lamps over the desk ── */}
        <path d="M600 0 V44 M584 60 Q584 44 600 44 Q616 44 616 60 Z M596 60 q4 6 8 0" />
        <path d="M840 0 V44 M824 60 Q824 44 840 44 Q856 44 856 60 Z M836 60 q4 6 8 0" />

        {/* ── Lobby clocks ── */}
        <Clock x={660} y={64} hour={9} minute={10} />
        <Clock x={720} y={64} hour={2} minute={40} />
        <Clock x={780} y={64} hour={6} minute={25} />

        {/* ── Key cabinet: eight pigeonholes by three, keys on their hooks ── */}
        <path d="M552 104 H888 M560 110 H880" />
        <rect x="560" y="110" width="320" height="120" />
        {[1, 2, 3, 4, 5, 6, 7].map((c) => (
          <path key={`c${c}`} d={`M${560 + c * 40} 110 V230`} />
        ))}
        {[1, 2].map((r) => (
          <path key={`r${r}`} d={`M560 ${110 + r * 40} H880`} />
        ))}
        {KEYS.map(([c, r]) => (
          <Key key={`${c}-${r}`} x={580 + c * 40} y={116 + r * 40} />
        ))}

        {/* ── Reception desk ── */}
        <path d="M462 280 H978 V292 H462 Z" />
        <path d="M474 292 V380 M966 292 V380" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={482 + i * 69} y="302" width="57" height="68" />
        ))}
        {/* Banker's lamp */}
        <path d="M508 280 V276 H532 V280 M520 276 V254 M502 254 H538 L530 240 H510 Z" />
        {/* The guestbook, open, and a pen */}
        <path d="M664 280 Q682 270 700 276 Q718 270 736 280 M700 276 V280" />
        <path d="M744 278 L766 264" />
        {/* Desk bell */}
        <path d="M884 280 Q884 262 900 262 Q916 262 916 280 M880 280 H920 M900 262 V256 M896 256 H904" />
        {/* Flowers */}
        <path d="M936 280 Q930 268 938 260 H946 Q954 268 948 280" />
        <path d="M942 260 Q938 244 930 236 M942 260 Q944 242 950 230 M942 260 Q950 248 958 242" />
        <circle cx="930" cy="234" r="4" />
        <circle cx="950" cy="228" r="4" />
        <circle cx="959" cy="240" r="4" />

        {/* ── Right: armchair ── */}
        <path d="M1068 352 V300 Q1068 284 1084 284 H1146 Q1162 284 1162 300 V352" />
        <path d="M1056 372 V328 Q1056 318 1068 318 Q1080 318 1080 328 V372 Z" />
        <path d="M1150 372 V328 Q1150 318 1162 318 Q1174 318 1174 328 V372 Z" />
        <path d="M1080 340 H1150 M1080 352 H1150 M1060 372 V380 M1170 372 V380" />

        {/* Side table and lamp */}
        <path d="M1188 330 H1236 M1194 330 V380 M1230 330 V380 M1194 356 H1230" />
        <path d="M1204 330 V326 H1220 V330 M1212 326 V306 M1198 306 H1226 L1220 286 H1204 Z" />

        {/* Potted plant */}
        <path d="M1254 340 H1290 L1284 380 H1260 Z" />
        <Leaf d="M1272 340 Q1238 296 1236 252 Q1264 286 1272 340" />
        <Leaf d="M1272 340 Q1256 282 1270 226 Q1286 284 1272 340" />
        <Leaf d="M1272 340 Q1300 292 1312 254 Q1288 290 1272 340" />
        <Leaf d="M1272 340 Q1232 318 1222 300 Q1256 306 1272 340" />
        <Leaf d="M1272 340 Q1314 322 1326 302 Q1292 308 1272 340" />

        {/* Stairs, rising off to the right, with their rail */}
        <path d="M1330 380 V364 H1350 V348 H1370 V332 H1390 V316 H1410 V300 H1430 V284 H1440" />
        <path d="M1336 318 L1440 222" />
        {[1340, 1360, 1380, 1400, 1420].map((x, i) => (
          <path key={x} d={`M${x} ${364 - i * 16} V${318 - ((x - 1336) * 96) / 104}`} />
        ))}
      </g>
    </svg>
  );
}
