## File Index

```
/
├── README.md                        ← brand overview, content + visual foundations
├── SKILL.md                         ← agent skill manifest
├── colors_and_type.css              ← all CSS custom properties + utility classes
│
├── fonts/                           ← Avenir Next LT Pro (10 variants)
│   ├── AvenirNextLTPro-Regular.otf
│   ├── AvenirNextLTPro-Demi.otf
│   ├── AvenirNextLTPro-Bold.otf
│   ├── AvenirNextLTPro-Heavy.otf
│   ├── AvenirNextLTPro-UltLt.otf
│   ├── AvenirNextLTPro-It.otf
│   ├── AvenirNextLTPro-DemiIt.otf
│   ├── AvenirNextLTPro-Cn.otf
│   ├── AvenirNextLTPro-DemiCn.otf
│   └── AvenirNextLTPro-BoldCn.otf
│
├── preview/                         ← Design System tab cards (registered assets)
│   ├── colors-base.html             Colors · Purple & Teal scales + backgrounds
│   ├── colors-semantic.html         Colors · Text, border, and glow tokens
│   ├── type-scale.html              Type   · Full scale display → caption
│   ├── type-weights.html            Type   · All Avenir Next weights + mono
│   ├── spacing-tokens.html          Spacing· Spacing scale + border radii
│   ├── shadows-glows.html           Spacing· Shadow & glow token gallery
│   ├── buttons.html                 Components · 4 button variants
│   ├── nav-sidebar.html             Components · Sidebar navigation
│   ├── chat-messages.html           Components · Chat bubbles + typing state
│   ├── cards-surfaces.html          Components · Card variants + input field
│   ├── badges-labels.html           Components · Badges, tags, status indicators
│   └── icons.html                   Brand  · Lucide icon set usage
│
└── ui_kits/
    └── rpg-builder/
        ├── index.html               ← Full interactive LORE SANCTUM prototype
        ├── Sidebar.jsx              ← Nav sidebar + agent selector component
        ├── ChatView.jsx             ← Chat interface with simulated AI responses
        └── CodexView.jsx            ← Wiki tree + markdown reader
```

### How to Use

**For new HTML artifacts:**
```html
<link rel="stylesheet" href="../../colors_and_type.css">
<!-- or inline @font-face + :root vars from colors_and_type.css -->
```

**For production (React/Vue/vanilla):**
- Copy `colors_and_type.css` vars into your `:root`
- Copy font files from `fonts/` into your project
- Reference `ui_kits/rpg-builder/*.jsx` as component blueprints

**Icon system:**
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```
Then use `lucide.createElement(lucide.Shield)` or the `lucide-react` npm package.
