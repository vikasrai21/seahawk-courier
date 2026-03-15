/* =========================================================
   map.js — Animated India + World Coverage Map
   SVG-based with pulsing city nodes and animated routes
   ========================================================= */

const INDIA_CITIES = [
  { name:'Delhi',      x:285, y:148, size:'hub',    type:'hub'    },
  { name:'Mumbai',     x:228, y:248, size:'major',  type:'major'  },
  { name:'Bangalore',  x:265, y:318, size:'major',  type:'major'  },
  { name:'Chennai',    x:295, y:320, size:'major',  type:'major'  },
  { name:'Kolkata',    x:375, y:210, size:'major',  type:'major'  },
  { name:'Hyderabad',  x:282, y:278, size:'major',  type:'major'  },
  { name:'Ahmedabad',  x:213, y:218, size:'city',   type:'city'   },
  { name:'Pune',       x:235, y:270, size:'city',   type:'city'   },
  { name:'Jaipur',     x:258, y:172, size:'city',   type:'city'   },
  { name:'Lucknow',    x:318, y:168, size:'city',   type:'city'   },
  { name:'Surat',      x:218, y:232, size:'city',   type:'city'   },
  { name:'Chandigarh', x:276, y:130, size:'city',   type:'city'   },
  { name:'Kochi',      x:258, y:348, size:'city',   type:'city'   },
  { name:'Bhopal',     x:268, y:215, size:'city',   type:'city'   },
  { name:'Nagpur',     x:294, y:238, size:'city',   type:'city'   },
  { name:'Patna',      x:348, y:185, size:'city',   type:'city'   },
  { name:'Indore',     x:248, y:218, size:'city',   type:'city'   },
  { name:'Vadodara',   x:220, y:228, size:'city',   type:'city'   },
  { name:'Coimbatore', x:262, y:340, size:'city',   type:'city'   },
  { name:'Guwahati',   x:405, y:175, size:'city',   type:'ne'     },
  { name:'Bhubaneswar',x:360, y:238, size:'city',   type:'city'   },
  { name:'Raipur',     x:320, y:242, size:'city',   type:'city'   },
  { name:'Ranchi',     x:352, y:212, size:'city',   type:'city'   },
  { name:'Visakhapatnam',x:338,y:274,size:'city',  type:'city'   },
  { name:'Srinagar',   x:260, y:100, size:'city',   type:'city'   },
  { name:'Amritsar',   x:255, y:122, size:'city',   type:'city'   },
  { name:'Port Blair', x:430, y:310, size:'city',   type:'island' },
];

const INTL_CITIES = [
  { name:'Dubai',     x:155, y:210, label:'UAE'       },
  { name:'London',    x:60,  y:80,  label:'UK'        },
  { name:'Singapore', x:495, y:310, label:'SGP'       },
  { name:'New York',  x:30,  y:130, label:'USA'       },
  { name:'Sydney',    x:535, y:400, label:'AUS'       },
  { name:'Tokyo',     x:545, y:165, label:'JPN'       },
  { name:'Frankfurt', x:100, y:88,  label:'GER'       },
  { name:'Hong Kong', x:505, y:240, label:'HKG'       },
];

const ROUTES = [
  { from:'Delhi', to:'Dubai'     },
  { from:'Delhi', to:'London'    },
  { from:'Delhi', to:'Singapore' },
  { from:'Mumbai','to':'Dubai'   },
  { from:'Delhi', to:'Frankfurt' },
  { from:'Delhi', to:'Hong Kong' },
];

function buildMap() {
  const wrap = document.getElementById('indiaMapCanvas');
  if (!wrap) return;

  const W = 620, H = 460;

  // India rough outline path
  const INDIA_PATH = `M 270 90 L 285 96 L 300 98 L 318 105 L 335 112
    L 350 115 L 360 122 L 368 130 L 372 140 L 378 150
    L 390 158 L 400 170 L 408 178 L 412 190 L 405 200
    L 398 215 L 390 225 L 385 238 L 375 248 L 368 258
    L 360 266 L 355 274 L 345 280 L 338 290 L 332 300
    L 325 312 L 318 324 L 308 335 L 298 345 L 290 355
    L 280 365 L 272 358 L 265 348 L 258 338 L 252 326
    L 246 314 L 242 302 L 238 290 L 232 278 L 225 265
    L 218 252 L 214 240 L 210 228 L 208 215 L 210 202
    L 215 190 L 218 178 L 222 165 L 228 152 L 236 140
    L 245 128 L 252 116 L 260 104 L 268 95 Z`;

  const svg = `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
    <defs>
      <radialGradient id="mapBg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#0f2847"/>
        <stop offset="100%" style="stop-color:#0b1f3a"/>
      </radialGradient>
      <filter id="cityGlow">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="hubGlow">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#e8580a;stop-opacity:0.8"/>
        <stop offset="100%" style="stop-color:#e8580a;stop-opacity:0.1"/>
      </linearGradient>
      <linearGradient id="routeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:0.6"/>
        <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:0.1"/>
      </linearGradient>
      <marker id="arrowO" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 Z" fill="rgba(232,88,10,0.6)"/>
      </marker>
      <marker id="arrowB" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 Z" fill="rgba(96,165,250,0.6)"/>
      </marker>
    </defs>

    <!-- Background -->
    <rect width="${W}" height="${H}" fill="url(#mapBg)" rx="0"/>

    <!-- Grid dots -->
    ${Array.from({length:20},(_,i)=>Array.from({length:14},(_,j)=>`
      <circle cx="${i*32+10}" cy="${j*32+10}" r="0.8" fill="rgba(255,255,255,0.04)"/>
    `).join('')).join('')}

    <!-- India outline fill -->
    <path d="${INDIA_PATH}" fill="rgba(26,61,110,0.6)" stroke="rgba(255,255,255,0.12)" stroke-width="1.2"/>

    <!-- International route arcs -->
    <!-- Delhi → Dubai -->
    <path d="M ${INDIA_CITIES[0].x} ${INDIA_CITIES[0].y} Q 220 175 ${INTL_CITIES[0].x} ${INTL_CITIES[0].y}"
      fill="none" stroke="rgba(232,88,10,0.4)" stroke-width="1.2" stroke-dasharray="6 3"
      marker-end="url(#arrowO)" style="animation:dashRoute 3s linear infinite"/>
    <!-- Delhi → London -->
    <path d="M ${INDIA_CITIES[0].x} ${INDIA_CITIES[0].y} Q 175 60 ${INTL_CITIES[1].x} ${INTL_CITIES[1].y}"
      fill="none" stroke="rgba(96,165,250,0.3)" stroke-width="1" stroke-dasharray="5 4"
      marker-end="url(#arrowB)" style="animation:dashRoute 4.5s linear infinite"/>
    <!-- Delhi → Singapore -->
    <path d="M ${INDIA_CITIES[0].x} ${INDIA_CITIES[0].y} Q 420 240 ${INTL_CITIES[2].x} ${INTL_CITIES[2].y}"
      fill="none" stroke="rgba(74,222,128,0.35)" stroke-width="1.2" stroke-dasharray="6 3"
      style="animation:dashRoute 3.8s linear infinite"/>
    <!-- Mumbai → Dubai -->
    <path d="M ${INDIA_CITIES[1].x} ${INDIA_CITIES[1].y} Q 185 225 ${INTL_CITIES[0].x} ${INTL_CITIES[0].y}"
      fill="none" stroke="rgba(232,88,10,0.2)" stroke-width="1" stroke-dasharray="4 5"
      style="animation:dashRoute 5s linear infinite reverse"/>
    <!-- Delhi → Tokyo -->
    <path d="M ${INDIA_CITIES[0].x} ${INDIA_CITIES[0].y} Q 450 130 ${INTL_CITIES[5].x} ${INTL_CITIES[5].y}"
      fill="none" stroke="rgba(167,139,250,0.25)" stroke-width="1" stroke-dasharray="5 4"
      style="animation:dashRoute 5.5s linear infinite"/>
    <!-- Delhi → Frankfurt -->
    <path d="M ${INDIA_CITIES[0].x} ${INDIA_CITIES[0].y} Q 195 80 ${INTL_CITIES[6].x} ${INTL_CITIES[6].y}"
      fill="none" stroke="rgba(96,165,250,0.2)" stroke-width="1" stroke-dasharray="4 5"
      style="animation:dashRoute 6s linear infinite"/>

    <!-- Domestic route lines (lighter) -->
    ${[0,1,2,3,4,5].map(i => {
      const a = INDIA_CITIES[0], b = INDIA_CITIES[i+1];
      const mx = (a.x+b.x)/2 + (Math.random()-0.5)*30;
      const my = (a.y+b.y)/2 + (Math.random()-0.5)*20;
      return `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}"
        fill="none" stroke="rgba(232,88,10,0.18)" stroke-width="0.8" stroke-dasharray="3 4"
        style="animation:dashRoute ${3.5+i*0.5}s linear infinite"/>`;
    }).join('')}

    <!-- International city nodes -->
    ${INTL_CITIES.map((c,i) => `
      <circle cx="${c.x}" cy="${c.y}" r="12" fill="rgba(96,165,250,0.06)">
        <animate attributeName="r" values="8;16;8" dur="${3+i*0.4}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="${3+i*0.4}s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${c.x}" cy="${c.y}" r="5" fill="rgba(96,165,250,0.15)" stroke="rgba(96,165,250,0.4)" stroke-width="1"/>
      <circle cx="${c.x}" cy="${c.y}" r="3" fill="#60a5fa" filter="url(#cityGlow)"/>
      <text x="${c.x}" y="${c.y+18}" text-anchor="middle" font-family="system-ui" font-size="8" font-weight="700" fill="rgba(96,165,250,0.7)">${c.label}</text>
    `).join('')}

    <!-- India city nodes -->
    ${INDIA_CITIES.map((c,i) => {
      const isHub = c.type === 'hub';
      const isMajor = c.type === 'major';
      const isNE = c.type === 'ne';
      const isIsland = c.type === 'island';
      const r = isHub ? 6 : isMajor ? 4 : 3;
      const pulseR = isHub ? 20 : isMajor ? 14 : 10;
      const fill = isHub ? '#e8580a' : isMajor ? '#ff8c45' : isNE ? '#4ade80' : isIsland ? '#fbbf24' : 'rgba(255,255,255,0.7)';
      const delay = i * 0.3;

      return `
      <circle cx="${c.x}" cy="${c.y}" r="${pulseR}" fill="${fill.replace(')',',0.08)')}" stroke="none">
        <animate attributeName="r" values="${r};${pulseR};${r}" dur="${2.5+i*0.15}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0;0.8" dur="${2.5+i*0.15}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${c.x}" cy="${c.y}" r="${r}" fill="${fill}" filter="url(${isHub?'#hubGlow':'#cityGlow'})"/>
      ${isHub || isMajor ? `<text x="${c.x+r+4}" y="${c.y+3.5}" font-family="system-ui" font-size="${isHub?8.5:7.5}" font-weight="${isHub?800:600}" fill="${isHub?'#ff8c45':'rgba(255,255,255,0.65)'}">${c.name}</text>` : ''}`;
    }).join('')}

    <!-- LEGEND -->
    <rect x="${W-145}" y="10" width="135" height="95" rx="8" fill="rgba(11,31,58,0.85)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="${W-135}" y="30" font-family="system-ui" font-size="8" font-weight="800" fill="rgba(255,255,255,0.4)" letter-spacing="1.5">LEGEND</text>
    <circle cx="${W-133}" cy="44" r="5" fill="#e8580a" filter="url(#cityGlow)"/>
    <text x="${W-123}" y="48" font-family="system-ui" font-size="9" fill="rgba(255,255,255,0.75)">Main Hub</text>
    <circle cx="${W-133}" cy="62" r="4" fill="#ff8c45"/>
    <text x="${W-123}" y="66" font-family="system-ui" font-size="9" fill="rgba(255,255,255,0.65)">Major City</text>
    <circle cx="${W-133}" cy="80" r="3" fill="rgba(255,255,255,0.7)"/>
    <text x="${W-123}" y="84" font-family="system-ui" font-size="9" fill="rgba(255,255,255,0.55)">Service City</text>
    <circle cx="${W-133}" cy="98" r="3" fill="#60a5fa"/>
    <text x="${W-123}" y="102" font-family="system-ui" font-size="9" fill="rgba(255,255,255,0.55)">Int'l Gateway</text>

    <!-- CITY COUNT BADGE -->
    <rect x="10" y="${H-40}" width="150" height="30" rx="8" fill="rgba(232,88,10,0.15)" stroke="rgba(232,88,10,0.3)" stroke-width="1"/>
    <text x="22" y="${H-20}" font-family="Georgia,serif" font-size="13" font-weight="900" fill="white">800+</text>
    <text x="62" y="${H-20}" font-family="system-ui" font-size="9" font-weight="600" fill="rgba(255,255,255,0.6)">Cities Connected</text>

    <style>
      @keyframes dashRoute { to { stroke-dashoffset: -30 } }
    </style>
  </svg>`;

  wrap.innerHTML = svg;
}

document.addEventListener('DOMContentLoaded', buildMap);
