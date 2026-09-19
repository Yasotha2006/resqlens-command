# RESQLENS — AI Safety Intelligence Command Center

## Product goal
Build a polished, cinematic safety-intelligence application that lets a jury move from a monitored scene to a risk dossier, test a human response, compare outcomes, inspect recurring patterns, and question an AI copilot. The app will consistently frame outputs as estimates and decision support, never guaranteed physical outcomes.

## Experience structure

### 1. Landing page
- Full-viewport deep-space command experience with a custom lens/neural-ring mark, animated starfield, glowing AI core, orbital rings, pulse telemetry, and restrained cinematic motion.
- Lead with “RESQLENS — See the Risk. Explore the Response.” and the supplied supporting statement.
- Visual process rail: Vision → Risk Understanding → Response Exploration → Scenario Analysis → Improved Response.
- Continue into unframed sections for What ResQLens Does, How It Works, Response Explorer, Example Scenario, Technology Architecture, Responsible AI, and a final Enter Command Center action.
- Keep the next section visible below the first viewport and support reduced-motion preferences.

### 2. Command shell and navigation
- Build a responsive command shell with tabs for Command Center, Live Vision, Risk Galaxy, ResQLab, Risk Memory, and Settings / Architecture.
- Add persistent telemetry for AI status, live UTC time, and active session state.
- Use smooth view transitions, active-tab illumination, keyboard-friendly controls, and a compact mobile navigation treatment.

### 3. Live Vision
- Create an interactive scene analyzer with image/video upload preview, simulated detection overlays, bounding boxes, confidence badges, spatial labels, and scan telemetry.
- Include the four supplied scenarios and default to Emergency Pathway Obstruction at Building A / Floor 2 / Exit B.
- Implement Analyze Scene, Clear, and Load Demo Scenario controls with immediate deterministic demo evaluations suitable for a live presentation.

### 4. Risk dossier and timeline
- Show severity, confidence, hierarchical location, context summary, risk factors, and a potential-consequences matrix.
- Use “Potential,” “Possible,” and “Estimated” throughout generated assessments.
- Add an interactive audit timeline from normal scene through detection, analysis, response generation, and resolution.

### 5. ResQLab response exploration
- Present an AI-suggested response alongside a human “What would you do?” input and quick-fill proposals.
- Run the required five-stage, 1.5-second analysis sequence before revealing results.
- Display clearly labeled AI Scenario Estimates for feasibility, potential risk reduction, and remaining risk.
- Show strengths, supporting conditions, limitations, dependencies, and one of the three qualified verdicts.
- Contrast the original proposal with an improved synthesis and support re-analyzing the improved response in a repeatable loop.

### 6. What-if explorer and comparison
- Add toggleable operating conditions such as crowd surge, corridor blockage, obstruction cleared, and secondary exit opened.
- Recalculate the visible scenario estimates deterministically as conditions change.
- Provide side-by-side AI vs Human, Original vs Improved, and Current vs Proposed comparisons.

### 7. Risk Galaxy and Risk Memory
- Build an interactive orbital incident map with glowing severity nodes, relationship links, pulse states, and selectable telemetry dossiers.
- Add a historical incident log across locations and dates.
- Surface a Recurring Risk Pattern alert when similar incidents repeat at the same location.

### 8. ResQ Core copilot
- Add a persistent contextual assistant drawer using AI Elements conversation, message, prompt, loading, and tool-result primitives.
- Include contextual quick questions and stream responses from Lovable AI using the current scene, dossier, conditions, and response comparison.
- Keep assistant messages unboxed, user messages high contrast, and tool details collapsed by default.
- Surface service errors clearly and preserve the user’s input when a request cannot complete.

### 9. Architecture and Responsible AI
- Visualize the computer-vision, risk-reasoning, scenario-simulation, and response-synthesis layers.
- State that outputs are scenario estimates for decision support, depend on available observations and assumptions, and do not guarantee physical outcomes.
- Reinforce human oversight and show the evidence/assumptions behind recommendations.

## Data and demo behavior
- Use Lovable Cloud for persistent incident history, scenario analyses, and copilot conversation context.
- Seed the four demo scenarios and enough historical events to demonstrate recurring-pattern detection on first use.
- Keep upload analysis presentation-safe: local preview plus deterministic scenario overlays; do not claim real-world computer-vision inference for uploaded media unless an actual model result exists.
- Use server-side AI calls only; credentials and prompts never enter browser code.

## Visual system
- Deep ink/navy surfaces balanced with cyan, electric blue, violet, green, amber, and red status accents.
- Crisp technical display typography paired with a highly readable interface face; compact uppercase telemetry labels with normal letter spacing.
- Glass surfaces only where they improve hierarchy, thin luminous borders, subtle grid/star textures, and limited glow around active intelligence states.
- Generate a distinctive ResQLens lens/neural-ring identity asset rather than using a generic AI icon.
- Stable panel geometry and responsive constraints to avoid shifts or overlaps on desktop and mobile.

## Technical implementation
- Keep TanStack Start route-based architecture and create focused React modules for the shell, scene viewport, dossier, timeline, laboratory, comparison, galaxy, memory log, and copilot.
- Install and compose the official AI Elements primitives before implementing the copilot surface.
- Use the default Lovable AI chat model through a streaming server endpoint, with bounded retries only for transient failures.
- Add per-page titles, descriptions, Open Graph metadata, and Twitter card metadata.
- Validate with lint/build checks and browser-driven desktop/mobile walkthroughs of the default scenario, response simulation loop, what-if toggles, galaxy selection, memory alert, and copilot.
