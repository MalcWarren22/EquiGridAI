# EquiGrid AI Design Guidelines

## Design Approach

**Selected Approach:** Design System (Material Design + Linear) with sustainability tech aesthetic
- **Justification:** Enterprise SaaS with data-dense dashboards requires systematic design for consistency, while public marketing needs premium consumer appeal
- **Key References:** Linear's typography and restraint, Stripe's polish, modern sustainability platforms (Watershed, Persefoni)
- **Core Principles:** Calm confidence, data clarity, purposeful precision

## Typography System

**Font Stack:**
- **Primary:** Inter (Google Fonts) - UI, body text, data displays
- **Accent:** JetBrains Mono (Google Fonts) - numeric displays, code-like elements (ZIP codes, API keys)

**Hierarchy:**
- Hero Headlines: text-5xl to text-6xl, font-bold (48-60px)
- Section Headers: text-3xl to text-4xl, font-semibold (30-36px)
- Card Titles: text-xl, font-semibold (20px)
- Body Text: text-base, font-normal (16px)
- Data Labels: text-sm, font-medium (14px)
- Large Numbers (KPIs): text-4xl to text-5xl, font-bold, tabular-nums

## Color System (User-Specified)

**Dark Mode (Default):**
- Background: #0B0D0E
- Surface: #121416
- Text Primary: #EAECEF
- Text Muted: #9CA3AF
- Accent Positive (emerald/teal): #10B981, #14B8A6
- Accent Warning (amber): #F59E0B
- Accent Negative (soft red): #EF4444
- Borders: #1F2937

**Light Mode:**
- Background: #F8FAFC
- Surface: #FFFFFF
- Text Primary: #0F172A
- Text Muted: #64748B
- Accents: Same semantic colors with adjusted opacity
- Borders: #E2E8F0

## Layout System

**Spacing Primitives:** Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24, 32
- Component padding: p-4 to p-6
- Section padding: py-12 (mobile), py-20 (desktop), py-32 (hero)
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl with px-4 to px-8

**Grid Systems:**
- Dashboard KPIs: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Feature Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Chart Panels: 2-column layout (controls left, visualization right)
- Reports: Single column, max-w-4xl for readability

## Component Library

**Navigation:**
- Sticky header with backdrop-blur, minimal height (h-16)
- Logo left, primary nav center, CTA + mode toggle right
- Mobile: Hamburger menu with slide-out drawer
- Authenticated: Add persona pill badge next to user avatar

**Cards:**
- Rounded corners: rounded-lg (8px)
- Subtle shadow in light mode, border in dark mode
- Hover: subtle lift (translate-y-[-2px]) with shadow increase
- KPI cards: Large number top, delta badge with arrow, label bottom

**Buttons:**
- Primary: Emerald/teal fill, white text, px-6 py-3, rounded-lg
- Secondary: Border with accent color, transparent background
- Danger: Soft red for destructive actions
- Icon buttons: rounded-full, p-2, hover background

**Data Visualization:**
- Charts: Recharts with accent color scheme, grid lines subtle (#1F2937 dark, #E2E8F0 light)
- Map: MapLibre GL with dark base map (dark mode), light base map (light mode)
- Choropleth: Green gradient (low impact) to amber/red (high impact)
- Tooltips: Dark surface with rounded-lg, shadow-xl, white text

**Forms:**
- Input fields: border-2, rounded-lg, focus ring emerald
- Labels: text-sm font-medium, mb-2
- Validation: Red text-sm below field
- File upload: Dashed border drag-and-drop zone with icon

**Badges & Pills:**
- Delta indicators: rounded-full px-2 py-1, text-xs, with ↑/↓ arrows
- Status: rounded-full px-3 py-1, font-medium
- Persona toggle: Segmented control with sliding background

## Page-Specific Layouts

**Landing Page (/):**
- Full-viewport hero with gradient overlay on background image, centered content
- Large headline (text-6xl), subheadline (text-xl muted), dual CTA buttons
- Value cards section: 3-column grid with icons, titles, descriptions
- "Who We Serve" split: 2-column with illustrations/icons for each persona
- Stats bar: 4-column metrics with large numbers
- Final CTA section: centered with background accent

**Energy Zone (/energy-zone):**
- ZIP search bar: Prominent at top, autocomplete dropdown
- Map: Full-width below search, min-h-[500px], layer toggle buttons top-right
- KPI cards: 4-column grid below map
- 24h trends: Line charts in 2-column grid
- Cleaner hours: Pill badges in horizontal scroll container

**Dashboard (/app/dashboard):**
- Top: KPI cards in 4-column grid with delta badges
- Charts section: 2-column (cost chart left, carbon chart right)
- Mini map: Thumbnail linking to full view, rounded corners
- Persona-aware content: Cloud users see regional shift data, Operators see facility telemetry

**Recommendations (/app/recommendations):**
- Split layout: Controls panel (left 40%), Results panel (right 60%)
- Controls: Sliders, selects, stacked vertically with labels
- "Generate" button: Large, primary style
- Results: ROI widget with 3-column metrics, AI text below in card

**Reports (/app/reports):**
- Upload zone: Centered dashed border box, drag-and-drop
- Field mapping: Table with dropdown selectors
- Preview: Side-by-side (template left, filled right)
- Version history: List with timestamps, download icons

## Images

**Hero Image (Landing Page):**
- Description: Modern data center with clean lines, server racks with subtle blue/green lighting, suggesting efficiency and sustainability
- Placement: Full-width background with dark gradient overlay (0.6 opacity)
- Treatment: Slightly desaturated, professional photography style

**About Page:**
- Team section: Professional headshots in rounded circles
- Mission: Abstract geometric pattern or subtle grid visualization

**How It Works:**
- Step diagrams: Simple iconography with connecting lines, not photographic

## Accessibility

- WCAG AA contrast ratios enforced (4.5:1 text, 3:1 UI components)
- Focus visible: 2px emerald ring on all interactive elements
- Semantic HTML: nav, main, section, article, aside
- ARIA labels on icon-only buttons
- Reduced motion: Disable transitions when prefers-reduced-motion
- Keyboard navigation: Full support with visible focus states

## Animations (Minimal)

- Page transitions: None (instant)
- Hover states: subtle 200ms ease transform/opacity
- Loading: Skeleton screens (pulsing background)
- Toasts: Slide-in from top-right, 300ms ease
- Chart animations: 500ms on initial render only
- Map: Smooth zoom/pan, no auto-animations

## Mobile Adaptations

- Breakpoints: sm:640px, md:768px, lg:1024px, xl:1280px
- Navigation: Hamburger menu, full-screen overlay
- KPI cards: Stack to single column
- Charts: Full width, scrollable x-axis if needed
- Map: Reduce to 300px height on mobile, expand button
- Persona toggle: Full width on mobile