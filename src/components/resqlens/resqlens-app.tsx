import { useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Activity, AlertTriangle, Aperture, ArrowRight, Bot, BrainCircuit, Building2,
  CheckCircle2, ChevronRight, CircleDot, Clock3, Database, Eye, FileVideo,
  Gauge, GitCompareArrows, History, LayoutDashboard, Menu, MessageSquareText,
  Network, Orbit, Play, Radar, RefreshCw, Route, ScanLine, Send, Settings,
  ShieldCheck, Sparkle, Upload, Users, X, Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Conversation, ConversationContent, ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import brandMark from "@/assets/resqlens-mark.png";
import sceneImage from "@/assets/resqlens-exit-obstruction.jpg";
import { supabase } from "@/integrations/supabase/client";

type View = "landing" | "command" | "vision" | "galaxy" | "lab" | "memory" | "architecture";
type Scenario = {
  id: string; short: string; name: string; location: string; severity: "High" | "Medium" | "Low";
  confidence: number; summary: string; factors: string[]; consequences: string[];
  suggestion: string; box: string;
};

const scenarios: Scenario[] = [
  { id: "pathway-obstruction", short: "Exit obstruction", name: "Emergency Pathway Obstruction", location: "Building A / Floor 2 / Exit B", severity: "High", confidence: 94, summary: "Potential evacuation delay caused by an object partially obstructing the primary egress route.", factors: ["Primary exit approach narrowed", "Object inside egress envelope", "Alternative route available"], consequences: ["Possible evacuation delay", "Potential crowd compression", "Reduced responder access"], suggestion: "Dispatch facilities staff to clear Exit B, keep Corridor B open, and route occupants toward Exit C until verification.", box: "left-[49%] top-[34%] h-[27%] w-[14%]" },
  { id: "restricted-intrusion", short: "Zone intrusion", name: "Restricted Area Intrusion", location: "Hazard Zone A / Perimeter 03", severity: "High", confidence: 91, summary: "Possible unauthorized entry detected inside a controlled safety perimeter.", factors: ["Boundary crossed", "No clearance token visible", "Hazard operations active"], consequences: ["Possible exposure", "Potential process interruption", "Responder deployment"], suggestion: "Pause nearby activity, request remote identity verification, and dispatch trained security without direct confrontation.", box: "left-[31%] top-[23%] h-[48%] w-[14%]" },
  { id: "crowd-accumulation", short: "Crowd surge", name: "Crowd Accumulation", location: "Concourse South / Junction 4", severity: "Medium", confidence: 87, summary: "Estimated crowd density is rising near a narrow circulation point.", factors: ["Density trending upward", "Bidirectional traffic", "Narrow junction"], consequences: ["Possible bottleneck", "Potential trip hazard", "Slower emergency access"], suggestion: "Meter inbound flow, open the secondary lane, and position staff upstream to distribute movement.", box: "left-[15%] top-[29%] h-[43%] w-[31%]" },
  { id: "person-down", short: "Person down", name: "Person-Down / Possible Emergency Event", location: "Medical Station / East Corridor", severity: "High", confidence: 89, summary: "A possible person-down event may require rapid human verification and medical response.", factors: ["Sustained low posture", "No observed movement", "Medical station nearby"], consequences: ["Possible medical emergency", "Potential corridor obstruction", "Time-sensitive verification"], suggestion: "Alert the medical station, send a trained responder, and preserve a clear corridor while awaiting verification.", box: "left-[65%] top-[46%] h-[24%] w-[19%]" },
];
const defaultScenario: Scenario = scenarios[0] as Scenario;
type Incident = { id: string; location: string; note: string; occurred_at: string; scenario_id: string; severity: string; status: string };

function mergeScenarioRows(rows: { id: string; name: string; location: string; severity: string; confidence: number; summary: string }[]): Scenario[] {
  return rows.map((row) => {
    const fallback = scenarios.find((item) => item.id === row.id) ?? defaultScenario;
    const severity = ["High", "Medium", "Low"].includes(row.severity) ? row.severity as Scenario["severity"] : fallback.severity;
    return { ...fallback, ...row, severity };
  });
}

const viewMeta: Record<Exclude<View, "landing">, { title: string; description: string }> = {
  command: { title: "Command Center", description: "Unified visual safety intelligence, risk dossiers, and response exploration." },
  vision: { title: "Live Vision", description: "Explore visual observations, spatial telemetry, and potential scene risks." },
  galaxy: { title: "Risk Galaxy", description: "Navigate a spatial constellation of potential safety incidents." },
  lab: { title: "ResQLab", description: "Test human response ideas against possible constraints and scenario estimates." },
  memory: { title: "Risk Memory", description: "Review historical incidents and recurring potential risk patterns." },
  architecture: { title: "Architecture", description: "Inspect ResQLens intelligence layers and responsible AI boundaries." },
};

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) { element = document.createElement("meta"); element.setAttribute(property ? "property" : "name", name); document.head.appendChild(element); }
  element.content = content;
}

const nav: { id: View; label: string; icon: typeof Eye }[] = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "vision", label: "Live Vision", icon: Eye },
  { id: "galaxy", label: "Risk Galaxy", icon: Orbit },
  { id: "lab", label: "ResQLab", icon: BrainCircuit },
  { id: "memory", label: "Risk Memory", icon: History },
  { id: "architecture", label: "Settings / Architecture", icon: Settings },
];

function Label({ children, tone = "cyan" }: { children: React.ReactNode; tone?: "cyan" | "amber" | "violet" | "green" }) {
  return <span className={`tech-label text-${tone}`}>{children}</span>;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`glass-panel ${className}`}>{children}</section>;
}

function Metric({ label, value, unit = "%", color = "cyan" }: { label: string; value: number; unit?: string; color?: string }) {
  return <div className="metric"><div className="flex items-center justify-between"><span>{label}</span><strong>{value}{unit}</strong></div><div className="metric-track"><i className={`metric-fill bg-${color}`} style={{ width: `${value}%` }} /></div><small>AI Scenario Estimate</small></div>;
}

function LiveClock() {
  const [time, setTime] = useState("--:--:--");
  useEffect(() => { const tick = () => setTime(new Date().toUTCString().slice(17, 25)); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  return <span className="font-mono text-xs text-foreground">{time} UTC</span>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5"><img src={brandMark} width={compact ? 32 : 42} height={compact ? 32 : 42} alt="ResQLens neural lens" className="drop-shadow-[0_0_14px_var(--cyan-glow)]" /><div><strong className="font-display text-base text-foreground">RESQ<span className="text-cyan">LENS</span></strong>{!compact && <div className="tech-label text-[8px]">Safety intelligence</div>}</div></div>;
}

function Landing({ enter }: { enter: () => void }) {
  const pipeline = ["Vision", "Risk Understanding", "Response Exploration", "Scenario Analysis", "Improved Response"];
  return <main className="starfield min-h-screen overflow-hidden bg-background">
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 px-5 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo /><Button onClick={enter} size="sm"><Radar />Enter Command Center</Button></div></header>
    <section className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-center px-5 pb-20 pt-28 text-center">
      <div className="mb-5 flex items-center gap-2"><span className="status-dot" /><Label tone="green">AI SYSTEM ONLINE / SESSION 01</Label></div>
      <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[1.02] text-foreground sm:text-7xl lg:text-8xl">See the Risk.<br /><span className="text-glow">Explore the Response.</span></h1>
      <p className="mt-7 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">AI-powered visual safety intelligence that helps understand situations, explore possible responses, and evaluate human-proposed solutions.</p>
      <div className="core-stage my-10" aria-hidden="true"><div className="orbit-ring ring-one"/><div className="orbit-ring ring-two"/><div className="core-glow"><img src={brandMark} width={180} height={180} alt="" /></div><i className="orbit-node node-a"/><i className="orbit-node node-b"/><i className="orbit-node node-c"/></div>
      <Button size="lg" onClick={enter} className="group">Initialize Command Center <ArrowRight className="transition-transform group-hover:translate-x-1" /></Button>
      <div className="mt-14 flex w-full max-w-5xl flex-wrap items-center justify-center gap-2">{pipeline.map((item, index) => <div key={item} className="flex items-center gap-2"><span className="pipeline-step"><b>0{index + 1}</b>{item}</span>{index < pipeline.length - 1 && <ChevronRight className="size-3 text-muted-foreground" />}</div>)}</div>
    </section>
    <section className="border-y border-border/50 bg-surface/40 px-5 py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><Label>What ResQLens does</Label><h2 className="mt-4 font-display text-4xl text-foreground">From observation to a more informed response.</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground">ResQLens turns visual observations into transparent risk dossiers, explores possible response paths, and reveals the assumptions behind every estimate.</p></div><div className="grid gap-px bg-border sm:grid-cols-3">{[{Icon:Eye,title:"Observe",copy:"Spatial signals and context"},{Icon:BrainCircuit,title:"Reason",copy:"Potential risk and consequences"},{Icon:GitCompareArrows,title:"Explore",copy:"Compare human and AI responses"}].map(({Icon,title,copy}) => <div className="bg-background p-7" key={title}><Icon className="mb-8 size-6 text-cyan"/><h3 className="font-display text-xl">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{copy}</p></div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-24"><Label tone="violet">Response Explorer</Label><div className="mt-5 grid items-center gap-12 lg:grid-cols-2"><div><h2 className="font-display text-4xl">Test your response before you act.</h2><p className="mt-5 leading-7 text-muted-foreground">Change conditions, compare proposals, and inspect estimated trade-offs before a decision reaches the floor.</p><Button onClick={enter} variant="outline" className="mt-7">Explore the default scenario <ArrowRight /></Button></div><div className="comparison-preview"><div><small>HUMAN PROPOSAL</small><p>Move people through Corridor B.</p></div><ArrowRight/><div className="border-cyan/30"><small>IMPROVED SYNTHESIS</small><p>Split flow between Corridor B and Exit C.</p></div></div></div></section>
    <section className="border-y border-border/50 bg-surface/30 px-5 py-24"><div className="mx-auto max-w-7xl"><Label>Example scenario</Label><div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_.6fr]"><div className="scene-mini"><img src={sceneImage} width={1536} height={864} alt="Building A corridor with a possible Exit B obstruction" /><span className="demo-box">OBJECT / 94%</span></div><div className="space-y-5"><h2 className="font-display text-3xl">Exit B obstruction</h2><p className="text-muted-foreground">Building A / Floor 2</p><div className="severity-pill high">High potential risk</div><p className="leading-7 text-muted-foreground">A maintenance cart may reduce the usable path width during an evacuation.</p></div></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-24"><div className="grid gap-16 lg:grid-cols-2"><div><Label tone="violet">Technology architecture</Label><h2 className="mt-4 font-display text-3xl">Four coordinated intelligence layers.</h2><div className="mt-8 space-y-3">{["Computer vision observation","Context-aware risk reasoning","What-if scenario simulation","Response synthesis & comparison"].map((x,i)=><div className="arch-row" key={x}><b>0{i+1}</b><span>{x}</span><Activity className="size-4 text-cyan"/></div>)}</div></div><div><Label tone="green">Responsible AI</Label><h2 className="mt-4 font-display text-3xl">Decision support, never certainty.</h2><p className="mt-6 leading-7 text-muted-foreground">Outputs are scenario estimates based on available observations and assumptions. They do not guarantee physical outcomes. Human verification, local procedures, and qualified responders remain essential.</p><div className="mt-8 flex items-start gap-3 border-l-2 border-green pl-5"><ShieldCheck className="mt-1 size-5 text-green"/><p className="text-sm text-foreground">Every recommendation keeps its evidence, conditions, and limitations visible.</p></div></div></div></section>
    <footer className="border-t border-border px-5 py-14 text-center"><Logo compact/><h2 className="mt-7 font-display text-3xl">Ready to explore the response?</h2><Button onClick={enter} className="mt-6">Enter Command Center <ArrowRight/></Button></footer>
  </main>;
}

function SceneView({ scenario, analyzed, onAnalyze, onClear, onUpload }: { scenario: Scenario; analyzed: boolean; onAnalyze: () => void; onClear: () => void; onUpload: (url: string) => void }) {
  const [custom, setCustom] = useState<string>();
  return <Panel className="overflow-hidden p-0"><div className="panel-head"><div><Label>LIVE VISION / CAM-A2-04</Label><h2 className="mt-1 font-display text-xl">{scenario.name}</h2></div><span className="live-chip"><i/>LIVE</span></div><div className="scene-view"><img src={custom ?? sceneImage} width={1536} height={864} alt={`Monitored scene: ${scenario.name}`} />{analyzed && <><div className={`detection-box ${scenario.box}`}><span>POTENTIAL HAZARD · {scenario.confidence}%</span><i/><i/></div><div className="scan-line"/><div className="scene-coordinates">CAM A2-04 / X 52.4 / Y 38.1<br/>SPATIAL MODEL ACTIVE</div></>}</div><div className="flex flex-wrap gap-2 border-t border-border p-4"><Button onClick={onAnalyze}><ScanLine/>Analyze Scene</Button><Button variant="outline" onClick={onClear}><X/>Clear</Button><label className="upload-control"><Upload className="size-4"/>Upload visual<input type="file" accept="image/*,video/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f){const url=URL.createObjectURL(f); setCustom(url); onUpload(url)}}}/></label><span className="ml-auto self-center text-xs text-muted-foreground">Local preview · simulated overlay</span></div></Panel>;
}

function Dossier({ s }: { s: Scenario }) {
  const steps = ["Scene normal","Object detected","Potential risk identified","Risk analyzed","Response generated","Resolved"];
  return <div className="grid gap-4 xl:grid-cols-2"><Panel><div className="panel-head px-0 pt-0"><div><Label>Risk dossier</Label><h3 className="mt-1 font-display text-xl">Situational assessment</h3></div><span className={`severity-pill ${s.severity.toLowerCase()}`}>{s.severity}</span></div><div className="grid grid-cols-2 gap-3"><Metric label="Confidence" value={s.confidence}/><div className="data-cell"><small>LOCATION</small><strong>{s.location}</strong></div></div><p className="mt-5 text-sm leading-6 text-muted-foreground">{s.summary}</p><div className="mt-5"><Label tone="amber">Potential risk factors</Label>{s.factors.map(f=><div className="list-line" key={f}><CircleDot/>{f}</div>)}</div></Panel><Panel><Label tone="violet">Potential consequences</Label><div className="mt-4 grid gap-2">{s.consequences.map((c,i)=><div className="consequence" key={c}><span>0{i+1}</span><p>{c}</p><small>{i===0?"Higher likelihood":"Condition-dependent"}</small></div>)}</div><Label>Incident timeline</Label><div className="timeline">{steps.map((x,i)=><button className={i<5?"done":""} key={x} title={x}><i/><span>{x}</span></button>)}</div></Panel></div>;
}

function ResQLab({ scenario }: { scenario: Scenario }) {
  const [proposal, setProposal] = useState("Move people through Corridor B and keep Exit C available");
  const [stage, setStage] = useState(-1);
  const [done, setDone] = useState(false);
  const [conditions, setConditions] = useState({ surge: false, blocked: false, cleared: false, secondary: true });
  const sequence: [string, string, string, string, string] = ["ANALYZING RESPONSE...","CHECKING CONDITIONS...","IDENTIFYING CONSTRAINTS...","EXPLORING CONSEQUENCES...","GENERATING RESPONSE ANALYSIS..."];
  const analyze = () => { setDone(false); setStage(0); sequence.forEach((_,i)=>setTimeout(()=>setStage(i),i*300)); setTimeout(()=>{setDone(true);setStage(-1)},1500); };
  const delta = (conditions.cleared?10:0)+(conditions.secondary?6:0)-(conditions.surge?12:0)-(conditions.blocked?18:0);
  const feasibility = Math.max(28, Math.min(96, 78+delta));
  const toggles: { key: keyof typeof conditions; label: string }[] = [{key:"surge",label:"Crowd density surge"},{key:"blocked",label:"Corridor B blocked"},{key:"cleared",label:"Obstruction cleared"},{key:"secondary",label:"Secondary exit opened"}];
  return <div className="space-y-4"><div className="section-title"><div><Label tone="violet">RESQLAB / RESPONSE EXPLORATION LABORATORY</Label><h2>Test your response before you act.</h2></div><BrainCircuit className="size-9 text-violet"/></div><div className="grid gap-4 xl:grid-cols-2"><Panel><Label>AI suggested response</Label><p className="mt-4 leading-7 text-foreground">{scenario.suggestion}</p><div className="mt-5 border-t border-border pt-5"><label className="tech-label text-violet" htmlFor="proposal">WHAT WOULD YOU DO?</label><textarea id="proposal" className="response-input" value={proposal} onChange={e=>setProposal(e.target.value)} /><div className="mt-3 flex flex-wrap gap-2"><button className="quick-fill" onClick={()=>setProposal("Move people through Corridor B and keep Exit C available")}>Split evacuation flow</button><button className="quick-fill" onClick={()=>setProposal("Clear the obstruction first, then reopen Exit B under staff supervision")}>Clear then reopen</button></div><Button className="mt-4 w-full" onClick={analyze}><Play/>Simulate response</Button></div></Panel><Panel>{stage>=0&&!done?<div className="simulation-state"><Radar className="size-12 animate-spin-slow text-cyan"/><Shimmer className="font-mono text-sm">{sequence[stage] ?? sequence[0]}</Shimmer><div className="progress-scan"><i style={{width:`${(stage+1)*20}%`}}/></div></div>:<><div className="panel-head px-0 pt-0"><Label tone="green">Response evaluation</Label><span className="verdict viable">POTENTIALLY VIABLE</span></div><div className="grid gap-3 sm:grid-cols-3"><Metric label="Feasibility" value={feasibility}/><Metric label="Risk reduction" value={Math.max(20,72+delta)} color="green"/><Metric label="Remaining risk" value={Math.max(8,28-delta)} color="amber"/></div><div className="mt-5 grid gap-5 md:grid-cols-2"><div><Label tone="green">Why this may work</Label><div className="list-line"><CheckCircle2/>Uses available alternate routes</div><div className="list-line"><CheckCircle2/>Maintains response access</div></div><div><Label tone="amber">Potential limitations</Label><div className="list-line"><AlertTriangle/>Corridor B may congest</div><div className="list-line"><AlertTriangle/>Requires staff coordination</div></div></div></>}</Panel></div><Panel><div className="panel-head px-0 pt-0"><div><Label>What-if scenario explorer</Label><h3 className="mt-1 font-display text-xl">Conditions shape the estimate</h3></div><Gauge className="text-cyan"/></div><div className="condition-grid">{toggles.map(({key,label})=><label key={key}><span>{label}</span><Switch checked={conditions[key]} onCheckedChange={v=>setConditions(p=>({...p,[key]:v}))}/></label>)}</div></Panel><Panel><Label tone="violet">How could we improve your idea?</Label><div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr]"><div className="proposal-card"><small>ORIGINAL HUMAN PROPOSAL</small><p>{proposal}</p></div><ArrowRight className="self-center text-muted-foreground"/><div className="proposal-card improved"><small>IMPROVED SYNTHESIS</small><p>Distribute occupants between Corridor B and Exit C, meter movement at the junction, and keep a responder lane clear.</p><Button variant="outline" size="sm" onClick={()=>{setProposal("Distribute occupants between Corridor B and Exit C, meter movement, and preserve a responder lane");analyze();}}><RefreshCw/>Re-analyze</Button></div></div></Panel></div>;
}

function Galaxy({ select, items }: { select: (s: Scenario) => void; items: Scenario[] }) {
  const positions: [number, number][] = [[50,18],[22,48],[76,46],[47,79]];
  return <div className="space-y-4"><div className="section-title"><div><Label>Risk galaxy</Label><h2>Spatial incident constellation</h2></div><Orbit className="size-9 text-cyan"/></div><Panel className="galaxy"><div className="galaxy-core"><img src={brandMark} width={92} height={92} alt="ResQLens core"/></div><div className="galaxy-orbit orbit-a"/><div className="galaxy-orbit orbit-b"/><svg aria-hidden="true" viewBox="0 0 100 100"><path d="M50 50 L50 18 M50 50 L22 48 M50 50 L76 46 M50 50 L47 79"/></svg>{items.map((s,i)=>{const p=positions[i] ?? [50,50]; return <button key={s.id} className={`risk-node ${s.severity.toLowerCase()}`} style={{left:`${p[0]}%`,top:`${p[1]}%`}} onClick={()=>select(s)}><i/><span>{s.short}<small>{s.location.split(" / ")[0]}</small></span></button>})}<div className="galaxy-legend"><span><i className="high"/>High</span><span><i className="medium"/>Medium</span><span><i className="resolved"/>Resolved</span></div></Panel></div>;
}

function MemoryView({ incidents, items }: { incidents: Incident[]; items: Scenario[] }) {
  const recurring = incidents.filter((incident) => incident.location === "Building A / Floor 2 / Exit B").length;
  const rows = incidents.map((incident) => ({ ...incident, name: items.find((item) => item.id === incident.scenario_id)?.name ?? incident.note }));
  return <div className="space-y-4"><div className="section-title"><div><Label>Risk memory</Label><h2>Historical incidents & patterns</h2></div><Database className="size-9 text-cyan"/></div>{recurring>=3&&<div className="pattern-alert"><AlertTriangle/><div><Label tone="amber">Recurring risk pattern</Label><strong>{recurring} related pathway obstructions at Building A / Floor 2 / Exit B</strong><p>Estimated recurrence suggests a possible facilities workflow issue near the egress zone.</p></div><span>{recurring}× / 14 DAYS</span></div>}<Panel className="p-0"><div className="memory-table">{rows.map(r=><div className="memory-row" key={r.id}><span className="font-mono text-xs text-muted-foreground">{new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(new Date(r.occurred_at)).toUpperCase()}</span><strong>{r.name}</strong><span>{r.location}</span><span className={`severity-pill ${r.severity.toLowerCase()}`}>{r.severity}</span><small>{r.status}</small></div>)}</div></Panel></div>;
}

function ArchitectureView() { const layers=[{Icon:Eye,n:"01",title:"VISION LAYER",copy:"Scene observations, object regions, spatial context"},{Icon:BrainCircuit,n:"02",title:"RISK REASONING",copy:"Potential hazards, confidence, consequence pathways"},{Icon:Orbit,n:"03",title:"SCENARIO SIMULATION",copy:"Condition toggles, constraints, estimated outcomes"},{Icon:GitCompareArrows,n:"04",title:"RESPONSE SYNTHESIS",copy:"Human + AI proposals, improvements, qualified verdicts"}]; return <div className="space-y-4"><div className="section-title"><div><Label>Settings / Architecture</Label><h2>Transparent intelligence stack</h2></div><Network className="size-9 text-violet"/></div><div className="architecture-map">{layers.map(({Icon,n,title,copy},i)=><div className="arch-module" key={title}><Icon className="size-7 text-cyan"/><span>{n}</span><h3>{title}</h3><p>{copy}</p>{i<3&&<ArrowRight/>}</div>)}</div><Panel><div className="grid gap-8 lg:grid-cols-2"><div><Label tone="green">Responsible AI boundary</Label><h3 className="mt-3 font-display text-2xl">Human judgment remains in command.</h3><p className="mt-4 leading-7 text-muted-foreground">ResQLens provides decision support from incomplete observations. Every output is a potential or estimated outcome—not a guarantee of safety, causality, or operational success.</p></div><div className="space-y-3">{["Evidence and assumptions remain visible","Uncertainty is expressed, never hidden","Qualified responders verify critical events","Local procedures override model suggestions"].map(x=><div className="list-line" key={x}><ShieldCheck/>{x}</div>)}</div></div></Panel></div> }

function Copilot({ open, close, scenario, conditions }: { open: boolean; close:()=>void; scenario: Scenario; conditions: string[] }) {
  const transport = useMemo(()=>new DefaultChatTransport({ api: "/api/chat", prepareSendMessagesRequest: ({messages}) => ({body:{messages,context:{scenario:scenario.name,location:scenario.location,severity:scenario.severity,confidence:scenario.confidence,conditions}}}) }),[scenario,conditions]);
  const { messages, sendMessage, status, stop, setMessages, error } = useChat({ id:"resqlens-command-session", transport, onFinish: ({messages: finished}) => { fetch("/api/chat",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({messages:finished})}).catch(()=>undefined); } });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{fetch("/api/chat").then(r=>r.json()).then((d:{messages?:UIMessage[]})=>{if(Array.isArray(d.messages))setMessages(d.messages)}).catch(()=>undefined)},[setMessages]);
  useEffect(()=>{if(open) setTimeout(()=>inputRef.current?.focus(),100)},[open,status]);
  return <aside className={`copilot ${open?"open":""}`} aria-hidden={!open}><div className="copilot-head"><div className="flex items-center gap-3"><img src={brandMark} width={38} height={38} alt="ResQ Core"/><div><strong>RESQ CORE</strong><small><i/>Context linked · online</small></div></div><Button variant="ghost" size="icon" onClick={close} aria-label="Close ResQ Core"><X/></Button></div><div className="copilot-context"><span>{scenario.short}</span><span>{scenario.location}</span><span>{scenario.confidence}% confidence</span></div><Conversation className="min-h-0"><ConversationContent className="gap-5 p-5">{messages.length===0&&<div className="py-8 text-center"><Bot className="mx-auto size-8 text-cyan"/><h3 className="mt-4 font-display text-lg">Ask about this scenario</h3><p className="mt-2 text-sm text-muted-foreground">I can explain estimates, limitations, and response alternatives.</p></div>}{messages.map(m=><Message from={m.role} key={m.id}><MessageContent>{m.parts.map((p,i)=>p.type==="text"?<MessageResponse key={i}>{p.text}</MessageResponse>:null)}</MessageContent></Message>)}{status==="submitted"&&<Shimmer className="text-sm">Thinking through the scenario...</Shimmer>}{error&&<p className="text-sm text-destructive">{error.message}</p>}</ConversationContent><ConversationScrollButton/></Conversation><div className="quick-questions">{["Why isn't my response recommended?","What alternatives do I have?","Compare my idea with the AI suggestion"].map(q=><button onClick={()=>sendMessage({text:q})} key={q}>{q}</button>)}</div><PromptInput className="m-4 mt-0" onSubmit={async m=>{if(m.text.trim())await sendMessage({text:m.text})}}><PromptInputTextarea ref={inputRef} placeholder="Ask ResQ Core..."/><PromptInputFooter className="justify-between"><span className="text-[10px] text-muted-foreground">DECISION SUPPORT ONLY</span><PromptInputSubmit status={status} onStop={stop}/></PromptInputFooter></PromptInput></aside>;
}

function CommandApp({ exit }: { exit:()=>void }) {
  const [view,setView]=useState<View>("command"); const [scenario,setScenario]=useState<Scenario>(defaultScenario); const [analyzed,setAnalyzed]=useState(true); const [copilot,setCopilot]=useState(false); const [mobile,setMobile]=useState(false);
  const { data: liveScenarios = scenarios } = useQuery({ queryKey:["resqlens-scenarios"], queryFn:async()=>{const {data,error}=await supabase.from("resqlens_scenarios").select("id,name,location,severity,confidence,summary").order("created_at"); if(error) throw error; return mergeScenarioRows(data ?? []);}, staleTime:60_000 });
  const { data: incidents = [] } = useQuery({ queryKey:["resqlens-incidents"], queryFn:async()=>{const {data,error}=await supabase.from("resqlens_incidents").select("id,location,note,occurred_at,scenario_id,severity,status").order("occurred_at",{ascending:false}); if(error) throw error; return data ?? [];}, staleTime:60_000 });
  useEffect(()=>{ const meta=viewMeta[view as Exclude<View,"landing">]; document.title=`${meta.title} — ResQLens`; setMeta("description",meta.description); setMeta("og:title",`${meta.title} — ResQLens`,true); setMeta("og:description",meta.description,true); setMeta("twitter:title",`${meta.title} — ResQLens`); setMeta("twitter:description",meta.description); },[view]);
  const choose=(s:Scenario)=>{setScenario(s);setAnalyzed(true);setView("vision")};
  const primary = view==="command"||view==="vision";
   return <main className="command-app starfield"><header className="command-top"><button onClick={exit} className="brand-button" aria-label="Return to ResQLens home"><Logo/></button><nav>{nav.map(n=><button className={view===n.id?"active":""} onClick={()=>setView(n.id)} key={n.id}><n.icon/>{n.label}</button>)}</nav><div className="telemetry"><span><i/>AI SYSTEM ONLINE</span><LiveClock/><span>SESSION 01</span></div><Button variant="ghost" size="icon" className="mobile-menu" onClick={()=>setMobile(!mobile)}><Menu/></Button></header>{mobile&&<div className="mobile-nav">{nav.map(n=><button key={n.id} onClick={()=>{setView(n.id);setMobile(false)}}><n.icon/>{n.label}</button>)}</div>}<div className="command-body"><aside className="scenario-rail"><Label>Demo scenarios</Label>{liveScenarios.map((s,i)=><button className={scenario.id===s.id?"active":""} onClick={()=>choose(s)} key={s.id}><b>0{i+1}</b><span>{s.short}<small>{s.location}</small></span><i className={s.severity.toLowerCase()}/></button>)}<div className="rail-stat"><small>ACTIVE SENSORS</small><strong>12 / 12</strong><span>All feeds nominal</span></div></aside><div className="command-content">{primary&&<div className="space-y-4"><div className="section-title"><div><Label>{view==="command"?"Command Center / Situation 01":"Live Vision / Scene Intelligence"}</Label><h2>{scenario.name}</h2></div><div className="flex gap-2"><span className={`severity-pill ${scenario.severity.toLowerCase()}`}>{scenario.severity} potential risk</span><span className="confidence-badge">{scenario.confidence}%</span></div></div><div className="grid gap-4 2xl:grid-cols-[1.35fr_.65fr]"><SceneView scenario={scenario} analyzed={analyzed} onAnalyze={()=>setAnalyzed(true)} onClear={()=>setAnalyzed(false)} onUpload={()=>setAnalyzed(false)}/><Panel><Label>Scene telemetry</Label><div className="telemetry-list"><div><span>CAMERA</span><b>A2-04</b></div><div><span>FRAME RATE</span><b>29.97 FPS</b></div><div><span>OBJECTS</span><b>{analyzed?"04":"--"}</b></div><div><span>SPATIAL MAP</span><b className="text-green">LOCKED</b></div></div><Label tone="amber">Current signal</Label><p className="mt-3 text-sm leading-6 text-muted-foreground">{analyzed?scenario.summary:"Scene cleared. Select Analyze Scene to run the deterministic demo evaluation."}</p></Panel></div>{analyzed&&<Dossier s={scenario}/>}</div>}{view==="lab"&&<ResQLab scenario={scenario}/>} {view==="galaxy"&&<Galaxy select={choose} items={liveScenarios}/>} {view==="memory"&&<MemoryView incidents={incidents} items={liveScenarios}/>} {view==="architecture"&&<ArchitectureView/>}</div></div><Button className="copilot-launch" onClick={()=>setCopilot(true)}><MessageSquareText/><span>Ask ResQ Core</span><i/></Button><Copilot open={copilot} close={()=>setCopilot(false)} scenario={scenario} conditions={[]}/>{copilot&&<button className="drawer-scrim" onClick={()=>setCopilot(false)} aria-label="Close assistant"/>}</main>;
}

export function ResQLensApp() { const [entered,setEntered]=useState(false); return entered?<CommandApp exit={()=>setEntered(false)}/>:<Landing enter={()=>setEntered(true)}/>; }