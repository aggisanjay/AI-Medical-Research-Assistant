# CuraLink landing and workspace motion: design notes

**Scene.** `src/components/landing/HelixScene.tsx` is a real WebGL scene (Three.js via react-three-fiber). 108 physically based glass beads (transmission, iridescence) with emissive cores, additive-glow edges, a dispersive crystal, bloom, vignette, chromatic aberration and grain. Bead colour = source registry: PubMed (sky), OpenAlex (violet), ClinicalTrials.gov (emerald).
**Story.** Scroll morphs one object: double helix -> three source clusters -> knowledge graph -> verified-answer crystal, matching Retrieve / Reason / Verify.
**Robustness.** Lazy-loaded chunk; paused when off-screen; low-power path (no refraction or post effects) on phones; CSS fallback without WebGL; still frame under `prefers-reduced-motion`; headline never waits on the GPU for more than ~2s.
**Interactive demos.** 9-agent pipeline run (agent names from `multiAgentWorkflow.js`), live PII redaction and prompt-injection scanner (same regexes as `middleware/guardrails.js`), 4-tier PDF fallback ladder, hoverable graph, ledger bars.
**Content policy.** Removed unverifiable claims from the old page (publication counts, researcher counts, confidence scores, sample citations and statistics, pricing tiers). Demos are labelled as layout or illustrative.
**Workspace.** Animated view transitions, sliding active-nav pill, staggered entrance of each view's blocks.

## Workspace redesign (dashboard and every screen)

- **Kit:** `src/components/ui/kit.tsx` (Panel, Stat, Btn, Chip, Empty, Skeleton, ChartTip). Body text 14px+, meta 12.5px+, one button and card language everywhere.
- **Overview:** five KPI cards, source donut, publications-by-year area chart, stage-time bars, recent investigations, starter questions, real empty states. The grounding score shows "No data" instead of a hard-coded 88%.
- **Research processing:** the live run panel shows the nine real agents with a timer and is labelled as estimated (the old UI simulated three invented agents on a timer). Finished runs show true per-agent durations as proportional bars, plus grounding quality from the Citation Verification agent. Reports have a copy button; sources are tabbed (Publications / Trials / Your documents); token cost is shown only when the server reports it (the old UI invented counts and a model name).
- **Documents, Knowledge graph (real SVG graph), Observability (donut, stacked bars, table, health), Settings:** rebuilt. Settings contains only real controls (default answer format) and read-only safeguard info; the fake API-key field and no-op Save were removed.
- **Honesty fixes:** removed the "HIPAA Encrypted" badge, "Enterprise" tag, hard-coded "Mount Sinai Hospital" and "Dr. Sarah Jenkins" fallbacks, dead bell/help buttons and the "Mistral-7B" fallback model name.
- **Mobile:** the sidebar is an off-canvas drawer below 1024px.
