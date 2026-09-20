# ResQLens Command

Build RESQLENS: an AI-Powered Safety Intelligence & Response Exploration web application with a cinematic futuristic galaxy/space command center aesthetic.

Key Features & Specifications:
1. Product Architecture & Visual Identity:
   - Deep space universe aesthetic: dark navy/black surfaces, glowing cyan, electric blue, and violet accents, subtle animated starfield background, glassmorphism, thin futuristic borders, crisp technical typography.
   - Professional, technical, cinematic UI suitable for hackathon presentation and live jury demo.
   - Clean modular React components with rich interactive states.

2. Cinematic Landing Page:
   - Hero section: "RESQLENS — See the Risk. Explore the Response."
   - Subtitle: "AI-powered visual safety intelligence that helps understand situations, explore possible responses, and evaluate human-proposed solutions."
   - Central futuristic glowing AI core/orb surrounded by orbital rings and pulse indicators.
   - Visual workflow pipeline: VISION -> RISK UNDERSTANDING -> RESPONSE EXPLORATION -> SCENARIO ANALYSIS -> IMPROVED RESPONSE.
   - Sections: What ResQLens Does, How It Works, Response Explorer, Example Scenario, Technology Architecture, Responsible AI, and CTA to Enter Command Center.

3. Main Command Center & Top Navigation:
   - Top nav: Custom ResQLens Logo (lens + neural ring), tabs for Command Center, Live Vision, Risk Galaxy, ResQLab, Risk Memory, Settings/Architecture.
   - Telemetry status: AI System Status: ONLINE, live UTC clock, active session indicator.
   - Audio/visual cues or smooth transitions.

4. Live Vision & Demo Scenarios:
   - Interactive visual analysis panel with realistic bounding boxes, confidence badges, and spatial telemetry overlays.
   - Image & video upload simulation + 4 preconfigured demo scenarios:
     1. Emergency Pathway Obstruction (Default hackathon story: Building A, Floor 2, Exit B)
     2. Restricted Area Intrusion (Hazard Zone A perimeter breach)
     3. Crowd Accumulation (Concourse South bottleneck)
     4. Person-Down / Possible Emergency Event (Medical station corridor)
   - "Analyze Scene", "Clear", "Load Demo Scenario" controls with instantaneous realistic evaluation.

5. Risk Understanding Engine:
   - Detailed risk dossier: Severity (High/Medium/Low), Confidence score, Hierarchical location, Context summary.
   - Risk Factors breakdown and Potential Consequences matrix.
   - Strictly hedged, responsible AI language: "Potential", "Possible", "Estimated".
   - Incident Timeline: Interactive step-by-step audit log (Scene normal -> Object detected -> Potential risk identified -> Risk analyzed -> Response generated -> Resolved).

6. Signature Feature — ResQLab (Response Exploration Laboratory):
   - "Test your response before you act."
   - AI Suggested Response display.
   - Interactive human response input: "What would you do?" with quick-fill sample proposals (e.g. "Move people through Corridor B and keep Exit C available").
   - 1.5s Simulation Transition sequence:
     "ANALYZING RESPONSE..." -> "CHECKING CONDITIONS..." -> "IDENTIFYING CONSTRAINTS..." -> "EXPLORING CONSEQUENCES..." -> "GENERATING RESPONSE ANALYSIS..."
   - Futuristic Response Evaluation Panel:
     - Visual metrics with explicit "AI Scenario Estimate" labels: Feasibility %, Potential Risk Reduction %, Remaining Risk %.
     - "Why This Response May Work" (key strengths & supporting conditions).
     - "Potential Limitations" (failure points, congestion risks, dependencies).
     - Response Verdict: 🟢 POTENTIALLY VIABLE | 🟡 VIABLE WITH MODIFICATION | 🔴 NOT RECOMMENDED UNDER CURRENT CONDITIONS (never absolute "Safe/Unsafe").
   - "How Could We Improve Your Idea?":
     - Contrast original human proposal with improved synthesis (e.g., distributing crowd between Corridor B and Exit C).
     - "Re-analyze Improved Response" interactive loop.

7. What-If Scenario Explorer & Side-by-Side Comparison:
   - Interactive toggleable conditions (e.g., crowd density surges, corridor blocked, obstruction cleared, secondary exit opened).
   - Side-by-side comparison: Current Scenario vs Proposed Scenario, and AI Response vs User Response.

8. Risk Galaxy Visualization:
   - Spatial orbital visualization with glowing, pulsing incident nodes colored by severity (High, Medium, Low, Resolved).
   - Interactive orbital links between related events. Clicking nodes opens full telemetry dossier.

9. Risk Memory & Pattern Detection:
   - Historical log of prior incidents across floors and dates.
   - "RECURRING RISK PATTERN" alert when multiple similar incidents occur at the same location.

10. ResQ Core AI Copilot & Responsible AI:
    - Persistent AI assistant drawer/panel to ask contextual questions ("Why isn't my response recommended?", "What alternatives do I have?", "Compare my idea with the AI suggestion").
    - Transparent Responsible AI declaration clarifying decision-support bounds and lack of guaranteed physical outcomes.
    - Modular architecture overview highlighting computer vision, risk reasoning, and scenario simulation layers.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d69759cb-2fdd-42c6-9fb2-400a09018e29).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
