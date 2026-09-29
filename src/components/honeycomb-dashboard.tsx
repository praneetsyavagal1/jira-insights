"use client";

import { useState } from "react";

type Metric = {
  id: string;
  title: string;
  value: string;
  tone: "purple" | "red" | "blue" | "green" | "orange";
  summary: string;
  evidence: string[];
  actions: string[];
};

const metrics: Metric[] = [
  { id: "velocity", title: "Flow Velocity", value: "XX", tone: "purple", summary: "Sprint 7 delivered 56 completed story points versus the Sprint 1 baseline of 40, a 40% increase.", evidence: ["Sprint 1: 40 completed story points", "Sprint 7: 56 completed story points", "DASH-8 and DASH-14 recorded GitHub Copilot in Jira"], actions: ["Create an AI-assisted delivery playbook from DASH-8 and DASH-14.", "Track velocity with quality, blocked time, and predictability."] },
  { id: "flow-time", title: "Flow Time", value: "XX", tone: "orange", summary: "Lead time improved as smaller work items moved through refinement, review, and validation with fewer waits.", evidence: ["Annual comparison: 240 days to 95 days", "Smaller slices reduced queue exposure", "Clearer acceptance criteria shortened handoffs"], actions: ["Set a flow-time target by work type.", "Review the oldest in-flight items in every portfolio review."] },
  { id: "efficiency", title: "Flow Efficiency", value: "XX", tone: "green", summary: "Active delivery time increased because teams exposed dependencies earlier and kept less work in progress.", evidence: ["Annual comparison: 24% to 46%", "Earlier dependency conversations", "Shorter review loops"], actions: ["Limit work in progress at team and portfolio level.", "Measure waiting time separately from active engineering time."] },
  { id: "blocked", title: "Blocked Time", value: "XX", tone: "blue", summary: "Blocked time fell as ownership became clearer and dependency escalation happened earlier.", evidence: ["Annual comparison: 15 days to 3 days", "Faster escalation paths", "Dependencies surfaced during refinement"], actions: ["Assign an owner and due date to every blocker.", "Escalate blockers that age beyond one working day."] },
  { id: "defects", title: "Defects & Rework", value: "XX", tone: "red", summary: "Earlier validation and tighter work slices reduced defects and the amount of completed work that had to be revisited.", evidence: ["Annual comparison: 7 to 3 bugs per completed epic", "DASH-18 affected 800 customers", "DASH-19 was classified as a false positive"], actions: ["Prioritize defects using customer exposure × severity × value.", "Link every Critical defect to a corrective story."] },
  { id: "predictability", title: "Flow Predictability", value: "XX", tone: "blue", summary: "Planning became more reliable as stories became smaller, blockers were removed earlier, and late scope was challenged.", evidence: ["Annual comparison: 5.8/10 to 9.1/10", "Late low-value scope was removed", "Committed work was less frequently displaced"], actions: ["Review forecast versus realized value each quarter.", "Require an explicit trade-off for late scope." ] },
  { id: "unplanned", title: "Unplanned Work", value: "XX", tone: "orange", summary: "Product Management removed DASH-21 from FixVersion 1.2.0 because it arrived late with only $10K of value versus DASH-20's $500K.", evidence: ["DASH-21 arrived November 2, 2026", "DASH-21 was downgraded to Medium", "$10K of late scope was deferred"], actions: ["Gate late scope on value, timing, and displacement.", "Review deferred items at the next planning event."] },
  { id: "cost", title: "Defect Cost Avoidance", value: "XX", tone: "red", summary: "Resolving Critical defect DASH-18 protects an implied $4M of customer value: 800 affected customers × $5,000 per customer.", evidence: ["DASH-18: Critical production defect", "DASH-17: corrective action story", "DASH-19: false positive with no business impact"], actions: ["Show value at risk on every Critical defect.", "Separate false positives from actionable production risk."] },
];

const kpis = [
  ["Demand vs capacity", "113%", "Target 80–95% · ▲ 6 pts QoQ", "red"],
  ["Capacity gap", "3.8 FTE", "0.3 FTE can be redeployed", "red"],
  ["Time to SLA breach", "~9 wks", "Backlog runway: 2.0 wks", "amber"],
  ["Revenue at risk", "$420K", "Pipeline with no staff, next 90 days", "brown"],
] as const;

function DemandPanel() {
  return <section className="honey-demand-panel">
    <div className="honey-alert"><strong>Under capacity: demand is 13% above supply</strong><span>If nothing changes, the backlog breaches SLA in week 9. Closing the gap needs 3.8 more FTE, mostly in App Dev and Cloud Ops.</span></div>
    <div className="honey-demand-grid">
      <div className="honey-chart-card"><h3>Supply vs demand (hrs/week)</h3><svg viewBox="0 0 540 220" role="img" aria-label="Demand exceeds capacity over twelve weeks"><line x1="36" y1="20" x2="36" y2="180" /><line x1="36" y1="180" x2="520" y2="180" /><path className="demand-area" d="M36 145 C80 112 110 120 150 100 S220 116 255 78 S325 91 365 112 S400 125 430 62 S480 45 520 72 L520 180 L36 180Z" /><path className="demand-line" d="M36 145 C80 112 110 120 150 100 S220 116 255 78 S325 91 365 112 S400 125 430 62 S480 45 520 72" /><path className="capacity-line" d="M36 150 L380 150 L380 174 L425 174 L425 150 L520 150" />{["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"].map((week, i) => <text key={week} x={36 + i * 44} y="201">{week}</text>)}</svg><div className="honey-chart-legend"><span><i className="demand-dot" />Demand</span><span><i className="capacity-dot" />Capacity</span><span><i className="shortfall-dot" />Shortfall</span></div></div>
      <div className="honey-team-card"><h3>By team</h3>{[["Application dev", "119%", "−2.2", "Red"], ["Cloud operations", "125%", "−1.1", "Red"], ["Quality assurance", "109%", "−0.5", "Amber"], ["Business analysis", "83%", "+0.3", "Green"]].map(([team, load, gap, status]) => <div className="honey-team-row" key={team}><strong>{team}</strong><span>{load}</span><span className={gap.startsWith("−") ? "negative-number" : "positive-number"}>{gap}</span><b className={`status-${status.toLowerCase()}`}>{status}</b></div>)}</div>
    </div>
    <div className="honey-decisions"><h3>Decisions needed</h3><ol><li>Approve 2 developers and 1 Cloud Ops engineer by week 3.</li><li>Move 0.3 FTE of analyst time to QA with no added cost.</li><li>Push 2 low-priority enhancements to Q1 to add runway.</li></ol></div>
  </section>;
}

function MetricDetail({ metric, onClose }: { metric: Metric; onClose: () => void }) {
  return <aside className="honey-detail"><button type="button" className="honey-back" onClick={onClose}>← Back to overview</button><span className={`honey-badge ${metric.tone}`}>EXECUTIVE INSIGHT</span><h2>{metric.title}</h2><p className="honey-summary">{metric.summary}</p><section className="honey-detail-section purple"><h3>What the data says</h3><ul>{metric.evidence.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="honey-detail-section green"><h3>Actions for executives</h3><ul>{metric.actions.map((item) => <li key={item}>{item}</li>)}</ul></section></aside>;
}

export function HoneycombDashboard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeMetric = metrics.find((metric) => metric.id === activeId);
  return <main className="honey-shell"><header className="honey-header"><div><span className="honey-eyebrow">DASH · EXECUTIVE DELIVERY INTELLIGENCE</span><h1>Delivery Portfolio 360° View</h1><p>Click any metric to explore the executive insight.</p></div><div className="honey-period"><strong>FY2025</strong><span>May 2024 – Apr 2025</span></div></header><section className="honey-kpis">{kpis.map(([label, value, note, tone]) => <article key={label} className={tone}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</section><div className={`honey-stage ${activeMetric ? "open" : ""}`}><section className="honey-left"><div className="honey-legend"><span><i className="purple" />Delivery improvement</span><span><i className="red" />Executive risk</span><span><i className="blue" />Capacity focus</span><span className="honey-xx">Metric values shown as XX pending final calibration</span></div><div className="honeycomb"><button className="honey-center" type="button" onClick={() => setActiveId("velocity")}>TEAM<br />DELIVERY<br />INSIGHTS</button>{metrics.map((metric, index) => <button key={metric.id} type="button" className={`honey-hex ${metric.tone} honey-hex-${index + 1} ${activeId === metric.id ? "active" : ""}`} onClick={() => setActiveId(metric.id)}><span>{metric.title}</span><b>{metric.value}</b></button>)}</div><DemandPanel /></section>{activeMetric && <MetricDetail metric={activeMetric} onClose={() => setActiveId(null)} />}</div><footer className="honey-footer">Source: DASH Jira board and supplied executive scenario assumptions · Demand and capacity values are directional planning estimates.</footer></main>;
}
