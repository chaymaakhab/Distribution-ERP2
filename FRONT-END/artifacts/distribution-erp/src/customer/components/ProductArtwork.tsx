import type { Product } from '../api';

export default function ProductArtwork({ product }: { product: Product }) {
  let artwork;

  switch (product.sku) {
    case 'HRC-0850':
      artwork = (
        <g stroke="#24364a" strokeLinejoin="round" strokeWidth="3">
          <path d="M75 55h74l20 18-16 25h-33l-5 37H92l8-43-25-11z" fill="#f0a23a" />
          <path d="m145 57 28-12 13 12-19 22" fill="#60758b" />
          <path d="M103 104h28l-4 39h-25z" fill="#34495e" />
          <path d="m95 139 34 1-4 10H89z" fill="#26384b" />
          <path d="M83 61 67 69l10 23 15-5" fill="#f5bd61" />
          <path d="M178 48h18v9h-18z" fill="#9eafbe" />
        </g>
      );
      break;
    case 'CUT-230D':
      artwork = (
        <g>
          <circle cx="120" cy="86" r="54" fill="#506477" stroke="#25384d" strokeWidth="4" />
          <circle cx="120" cy="86" r="44" fill="#8293a2" stroke="#c7d2dc" strokeWidth="4" />
          <circle cx="120" cy="86" r="12" fill="#e8edf2" stroke="#26394d" strokeWidth="4" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <circle
              key={angle}
              cx={120 + Math.cos((angle * Math.PI) / 180) * 49}
              cy={86 + Math.sin((angle * Math.PI) / 180) * 49}
              r="3"
              fill="#dce4eb"
            />
          ))}
        </g>
      );
      break;
    case 'PMP-15HP':
      artwork = (
        <g stroke="#34495e" strokeLinejoin="round" strokeWidth="3">
          <path d="M91 49h55l12 15v62l-12 13H91l-12-13V64z" fill="#8ba2b4" />
          <path d="M96 40h45v12H96zM105 29h27v12h-27z" fill="#c4d0d9" />
          <path d="M88 72h61v40H88z" fill="#547d91" />
          <path d="M102 83h34M102 94h34M102 105h34" stroke="#d9e5ec" strokeWidth="4" />
          <path d="M105 139v10m28-10v10m-37 0h46" fill="none" />
        </g>
      );
      break;
    case 'CAB-3G25':
      artwork = (
        <g stroke="#34495e" strokeLinejoin="round" strokeWidth="3">
          <ellipse cx="119" cy="119" rx="57" ry="17" fill="#26394d" />
          <path d="M62 80v39c0 10 25 18 57 18s57-8 57-18V80" fill="#d89a35" />
          <ellipse cx="119" cy="80" rx="57" ry="18" fill="#f0b84f" />
          <ellipse cx="119" cy="80" rx="30" ry="10" fill="#f7f9fb" />
          <path d="M90 80v39c0 6 13 10 29 10s29-4 29-10V80" fill="#b87824" />
          <path d="M90 80c0-6 13-10 29-10s29 4 29 10-13 10-29 10-29-4-29-10z" fill="#e9edf1" />
          <path d="M146 112c21 0 37-7 37-17v-8" fill="none" stroke="#26394d" strokeWidth="8" />
        </g>
      );
      break;
    case 'GEN-5000':
      artwork = (
        <g stroke="#34495e" strokeLinejoin="round" strokeWidth="3">
          <path d="M68 61h105l11 13v61H68z" fill="#58778b" />
          <path d="M79 73h72v43H79z" fill="#93a8b7" />
          <path d="M89 83h49v22H89z" fill="#d1dce4" />
          <circle cx="91" cy="131" r="11" fill="#293b4f" />
          <circle cx="161" cy="131" r="11" fill="#293b4f" />
          <path d="M77 54v-9h88v9m-77 71h61" fill="none" />
          <circle cx="154" cy="83" r="5" fill="#f0a23a" />
        </g>
      );
      break;
    case 'TAB-12M':
      artwork = (
        <g stroke="#43576b" strokeLinejoin="round" strokeWidth="3">
          <rect x="76" y="37" width="88" height="105" rx="7" fill="#e8edf1" />
          <rect x="87" y="50" width="66" height="77" rx="3" fill="#c6d1da" />
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <rect x={94 + (i % 4) * 14} y={60 + Math.floor(i / 4) * 28} width="10" height="20" rx="2" fill="#f7f9fb" />
              <path d={`M${99 + (i % 4) * 14} ${64 + Math.floor(i / 4) * 28}v7`} stroke="#2582a8" strokeWidth="4" />
            </g>
          ))}
          <path d="M146 87v30m-8 9h7" fill="none" />
        </g>
      );
      break;
    case 'TUY-DN50':
      artwork = (
        <g stroke="#496777" strokeLinejoin="round" strokeWidth="3">
          <path d="M61 65h114v20H61z" fill="#e6edf1" />
          <path d="M61 65v20m114-20v20" fill="none" stroke="#9aabb7" strokeWidth="6" />
          <path d="M71 95h104v20H71z" fill="#b9d2df" />
          <path d="M71 95v20m104-20v20" fill="none" stroke="#7893a3" strokeWidth="6" />
          <path d="M81 125h93v13H81z" fill="#dce6eb" />
          <path d="M81 125v13m93-13v13" fill="none" stroke="#9aabb7" strokeWidth="4" />
        </g>
      );
      break;
    case 'CHA-100I':
      artwork = (
        <g stroke="#53687a" strokeLinejoin="round" strokeWidth="3">
          <path d="m79 53 78 27-10 29-78-27z" fill="#cbd5dd" />
          <path d="m89 85 77 27-10 29-78-27z" fill="#aebdc8" />
          <path d="m147 80 19-1-10 30-19 2zM157 112l19-1-10 30-19 1z" fill="#8194a4" />
          <circle cx="87" cy="70" r="4" fill="#f8fafb" />
          <circle cx="136" cy="87" r="4" fill="#f8fafb" />
          <circle cx="97" cy="101" r="4" fill="#f8fafb" />
          <circle cx="145" cy="119" r="4" fill="#f8fafb" />
        </g>
      );
      break;
    case 'VIS-7592':
      artwork = (
        <g transform="rotate(-35 120 86)" stroke="#485c70" strokeLinejoin="round" strokeWidth="3">
          <path d="M108 46h24v21l-5 7v48l-7 13-7-13V74l-5-7z" fill="#bac5ce" />
          <path d="M109 54h22M109 61h22M112 83h16m-16 10h16m-16 10h16" fill="none" />
          <path d="M115 135v13m10-13v13" fill="none" strokeWidth="2" />
        </g>
      );
      break;
    case 'DIS-40A':
      artwork = (
        <g stroke="#526579" strokeLinejoin="round" strokeWidth="3">
          <rect x="77" y="42" width="86" height="96" rx="7" fill="#edf1f4" />
          <rect x="88" y="54" width="64" height="70" rx="4" fill="#fff" />
          <path d="M100 54v-8m40 8v-8" fill="none" />
          <rect x="109" y="66" width="22" height="42" rx="4" fill="#d9e2e8" />
          <path d="m120 74-7 13h7l-3 12 10-16h-7l4-9" fill="#2786a8" stroke="none" />
          <circle cx="120" cy="116" r="3" fill="#42a66b" />
        </g>
      );
      break;
    case 'RAC-2027':
      artwork = (
        <g stroke="#715b35" strokeLinejoin="round" strokeWidth="3">
          <path d="M75 72h35v-17h24v17h31v29h-31v20h-24v-20H75z" fill="#d8ad54" />
          <path d="M75 72v29m8-29v29m8-29v29m8-29v29m8-29v29" fill="none" stroke="#f0d38a" strokeWidth="3" />
          <path d="M134 55v17m8 0v29m8-29v29m8-29v29m7-29v29" fill="none" stroke="#f0d38a" strokeWidth="3" />
          <path d="M110 58h24v12h-24zM110 101h24v15h-24z" fill="#bc8d36" />
        </g>
      );
      break;
    case 'PRJ-100W':
      artwork = (
        <g stroke="#43596f" strokeLinejoin="round" strokeWidth="3">
          <path d="M67 61h106l10 11v54H67z" fill="#526d84" />
          <rect x="79" y="72" width="81" height="42" rx="4" fill="#e2edf1" />
          <path d="M85 81h69m-69 10h69m-69 10h69" stroke="#9ec6d2" strokeWidth="5" />
          <path d="M92 127v12m56-12v12m-66 0h77" fill="none" />
          <path d="m120 53 0-11m-25 14-7-9m57 9 7-9" fill="none" stroke="#e4b652" />
        </g>
      );
      break;
    default:
      artwork = (
        <g stroke="#526579" strokeLinejoin="round" strokeWidth="3">
          <rect x="69" y="57" width="102" height="61" rx="9" fill="#bdcbd5" />
          <path d="M79 71h82v33H79z" fill="#eaf0f3" />
          <path d="M91 64v-9h58v9m-58 54v12m58-12v12" fill="none" />
          <circle cx="91" cy="86" r="5" fill="#d7a847" />
          <circle cx="149" cy="86" r="5" fill="#d7a847" />
        </g>
      );
  }

  return (
    <svg className="cx-product-artwork" viewBox="0 0 240 160" role="img" aria-label={`Illustration : ${product.name}`}>
      <defs>
        <linearGradient id="product-art-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e8eef3" />
        </linearGradient>
      </defs>
      <rect width="240" height="160" fill="url(#product-art-bg)" />
      <circle cx="40" cy="35" r="24" fill="#d9e8ef" opacity=".6" />
      <circle cx="204" cy="121" r="31" fill="#dce8ed" opacity=".65" />
      <ellipse cx="120" cy="145" rx="68" ry="7" fill="#bdcbd4" opacity=".55" />
      {artwork}
      <text x="226" y="151" textAnchor="end" fill="#708293" fontSize="8" fontFamily="sans-serif">ILLUSTRATION</text>
    </svg>
  );
}
