# CuraLink landing and workspace motion: design notes

**Scene.** `src/components/landing/HelixScene.tsx` is a real WebGL scene (Three.js via react-three-fiber). 108 physically based glass beads (transmission, iridescence) with emissive cores, additive-glow edges, a dispersive crystal, bloom, vignette, chromatic aberration and grain. Bead colour = source registry: PubMed (sky), OpenAlex (violet), ClinicalTrials.gov (emerald).
**Story.** Scroll morphs one object: double helix -> three source clusters -> knowledge graph -> verified-answer crystal, matching Retrieve / Reason / Verify.
**Robustness.** Lazy-loaded chunk; paused when off-screen; low-power path (no refraction or post effects) on phones; CSS fallback without WebGL; still frame under `prefers-reduced-motion`; headline never waits on the GPU for more than ~2s.
**Interactive demos.** 9-agent pipeline run (agent names from `multiAgentWorkflow.js`), live PII redaction and prompt-injection scanner (same regexes as `middleware/guardrails.js`), 4-tier PDF fallback ladder, hoverable graph, ledger bars.
**Content policy.** Removed unverifiable claims from the old page (publication counts, researcher counts, confidence scores, sample citations and statistics, pricing tiers). Demos are labelled as layout or illustrative.
**Workspace.** Animated view transitions, sliding active-nav pill, staggered entrance of each view's blocks.
