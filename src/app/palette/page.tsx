const swatches = [
  // Dark / Background
  { group: "Dark / Background", name: "primary", bg: "#1e0525", hover: null, label: "Footer card, reel overlay bg", dark: true },
  { group: "Dark / Background", name: "blackcurrant", bg: "#32073e", hover: null, label: "Nav button, reel bezel", dark: true },
  { group: "Dark / Background", name: "background", bg: "#ffffff", hover: null, label: "Page background", dark: false },

  // Text
  { group: "Text", name: "heading", bg: "#1e0525", hover: null, label: "All headings, primary text", dark: true },
  { group: "Text", name: "secondary", bg: "#524555", hover: null, label: "Secondary body text", dark: true },
  { group: "Text", name: "muted", bg: "#8e8292", hover: null, label: "Labels, captions, tags", dark: true },

  // Accent / Interactive
  { group: "Accent / Interactive", name: "grape", bg: "#895be7", hover: null, label: "Links, active nav, CTA buttons", dark: true },
  { group: "Accent / Interactive", name: "lilac", bg: "#d0b8ff", hover: null, label: "Sidebar nav active/hover bg", dark: false },

  // Surface / Tint
  { group: "Surface / Tint", name: "vanilla", bg: "#ece5d8", hover: null, label: "About section card bg", dark: false },
  { group: "Surface / Tint", name: "pink", bg: "#f8c2f7", hover: null, label: "Soft bg tints, gradients", dark: false },

  // One-off / Hover states
  { group: "One-off / Hover States", name: "#9D136A", bg: "#9D136A", hover: null, label: "ASH LLM button hover", dark: true },
  { group: "One-off / Hover States", name: "#481B55", bg: "#481B55", hover: null, label: "Reel overlay buttons base", dark: true },
  { group: "One-off / Hover States", name: "#f8f9fa", bg: "#f8f9fa", hover: null, label: "Case study sidebar nav card bg", dark: false },
  { group: "One-off / Hover States", name: "#edf0f3", bg: "#edf0f3", hover: null, label: "Case study sidebar nav card border", dark: false },
  { group: "One-off / Hover States", name: "#e8eaed", bg: "#e8eaed", hover: null, label: "Mobile nav tab border", dark: false },
];

const hoverPairs = [
  { label: "ASH LLM button", base: "#32073e", hover: "#9D136A" },
  { label: "Grape CTA / active state", base: "#895be7", hover: "#895be7" },
  { label: "Reel overlay buttons", base: "#481B55", hover: "#895be7" },
  { label: "Social icon circles (Discord)", base: "#67c23a", hover: "#67c23a (scale + tilt)" },
  { label: "Social icon circles (LinkedIn)", base: "#1f88f9", hover: "#1f88f9 (scale + tilt)" },
  { label: "Social icon circles (Twitter)", base: "#091624", hover: "#091624 (scale + tilt)" },
];

const groups = [...new Set(swatches.map((s) => s.group))];

export default function PalettePage() {
  return (
    <div className="min-h-screen bg-white p-10 font-sans">
      <h1 className="text-2xl font-bold mb-1 text-midnight">Colour Palette</h1>
      <p className="text-sm text-muted mb-10">All colours used in the portfolio site</p>

      {groups.map((group) => (
        <div key={group} className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">{group}</h2>
          <div className="flex flex-wrap gap-4">
            {swatches.filter((s) => s.group === group).map((s) => (
              <div key={s.name} className="flex flex-col gap-2 w-[160px]">
                <div
                  className="w-full h-[80px] rounded-[10px] border border-black/8 shadow-sm"
                  style={{ background: s.bg }}
                />
                <div>
                  <p className="text-[13px] font-semibold text-midnight">{s.name}</p>
                  <p className="text-[12px] text-muted font-mono">{s.bg}</p>
                  <p className="text-[11px] text-muted mt-0.5 leading-tight">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Hover State Pairs</h2>
        <div className="flex flex-col gap-4">
          {hoverPairs.map((p) => (
            <div key={p.label} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-[48px] h-[48px] rounded-[8px] border border-black/8 shadow-sm" style={{ background: p.base }} />
                <span className="text-muted text-lg">→</span>
                <div className="w-[48px] h-[48px] rounded-[8px] border border-black/8 shadow-sm" style={{ background: p.hover.split(" ")[0] }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-midnight">{p.label}</p>
                <p className="text-[11px] text-muted font-mono">{p.base} → {p.hover}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
