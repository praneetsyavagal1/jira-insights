"use client";

import { useState } from "react";

const topMetrics = [
  {
    label: "Total Estimated Value",
    value: "$16.31M",
    detail: "Total Value Realized Over 12 Months",
    info: "The value lift is consistent across speed, quality, and predictability: smaller batches moved through the system faster, AI-assisted delivery added capacity, and fewer interruptions left more time for planned work.",
    tone: "navy",
    icon: "value",
    href: "/insights?metric=business-value",
  },
  {
    label: "Revenue Impact",
    value: "$6.8M",
    detail: "From Earlier Revenue Realization",
    info: "Shorter flow time brought customer-facing capabilities to market earlier. Earlier feedback and smaller releases meant revenue opportunities were realized months sooner than in the baseline period.",
    tone: "green",
    icon: "money",
    href: "/insights?metric=revenue-impact",
  },
  {
    label: "Capacity Recovered",
    value: "$4.2M",
    detail: "Engineering Capacity Gained",
    info: "The team completed 145 epics per quarter versus 95 previously without adding equivalent headcount. Reusable patterns, better sequencing, and AI-assisted work on comparable stories helped recover delivery capacity.",
    tone: "purple",
    icon: "team",
    href: "/insights?metric=capacity-recovered",
  },
  {
    label: "Productivity Recovered",
    value: "$1.3M",
    detail: "From Reduced Blocking & Wait Time",
    info: "Average blocked time fell from 15 days to 3 days, returning working time to engineers. Earlier dependency conversations and faster decisions reduced queueing between analysis, development, testing, and approval.",
    tone: "cyan",
    icon: "clock",
    href: "/insights?metric=productivity-recovered",
  },
  {
    label: "Cost Avoidance",
    value: "$4M",
    detail: "Customer Value Protected",
    info: "The avoided-cost case is concentrated in DASH-18: a Critical production defect affected 800 customers and is being remediated by DASH-17. At the epic's $5,000 business-value assumption, resolving it protects about $4M (800 × $5,000); DASH-19 is a false positive and adds no business impact.",
    tone: "orange",
    icon: "shield",
    href: "/insights/cost-avoidance",
  },
  {
    label: "Unplanned Work Reduction",
    value: "$10K",
    detail: "Late Scope Deferred",
    info: "Product Management reduced unplanned-work risk by removing DASH-21 from FixVersion 1.2.0. It arrived late on November 2, 2026, carried only $10,000 of business value, and was downgraded to Medium, while the earlier Critical DASH-20—defined for the October 1 final phase with $500,000 of value—remained the focus.",
    tone: "pink",
    icon: "clipboard",
    href: "/insights/unplanned-work",
  },
] as const;

const flowMetrics = [
  {
    name: "Flow Velocity",
    description: "Completed epics per quarter (COUNT)",
    baseline: "95",
    baselineUnit: "epics/quarter",
    after: "145",
    afterUnit: "epics/quarter",
    change: "+53%",
    direction: "up",
    tone: "blue",
    info: "Velocity rose because the team standardized delivery patterns, split work into smaller slices, and used GitHub Copilot on comparable stories such as DASH-8 and DASH-14. Those changes reduced implementation effort without a matching increase in team size.",
    href: "/insights?metric=flow-velocity",
    points: "0,18 18,12 36,19 54,9 72,13 90,2 108,7 126,-3 144,2 162,-7 180,-2 198,-14",
  },
  {
    name: "Flow Time",
    description: "Median lead time for completed epics (calendar days)",
    baseline: "240",
    baselineUnit: "days",
    after: "95",
    afterUnit: "days",
    change: "-60%",
    direction: "down",
    tone: "orange",
    info: "Flow time fell as smaller work items spent less time waiting in queues. Earlier refinement, clearer acceptance criteria, and faster handoffs between engineering and validation helped work reach done sooner.",
    href: "/insights?metric=flow-time",
    points: "0,2 18,6 36,10 54,16 72,18 90,25 108,28 126,35 144,38 162,46 180,51 198,57",
  },
  {
    name: "Flow Efficiency",
    description: "Active time / Lead time (average proxy)",
    baseline: "24%",
    baselineUnit: "",
    after: "46%",
    afterUnit: "",
    change: "+92%",
    direction: "up",
    tone: "green",
    info: "Efficiency nearly doubled because work spent less time idle between stages. The team exposed dependencies earlier, shortened review loops, and kept fewer items in progress at once.",
    href: "/insights?metric=flow-efficiency",
    points: "0,29 18,23 36,20 54,19 72,13 90,17 108,10 126,12 144,5 162,2 180,-6 198,-13",
  },
  {
    name: "Blocked Time",
    description: "Average blocked days per completed epic",
    baseline: "15",
    baselineUnit: "days",
    after: "3",
    afterUnit: "days",
    change: "-80%",
    direction: "down",
    tone: "purple",
    info: "Blocked time dropped from 15 days to 3 days after dependencies were surfaced earlier and ownership became clearer. Faster escalation and resolution prevented blocked items from aging in the backlog.",
    href: "/insights?metric=blocked-time",
    points: "0,1 18,10 36,16 54,21 72,27 90,34 108,35 126,42 144,44 162,49 180,51 198,58",
  },
  {
    name: "Defects & Rework",
    description: "Bugs per completed epic (average)",
    baseline: "7",
    baselineUnit: "",
    after: "3",
    afterUnit: "",
    change: "-57%",
    direction: "down",
    tone: "pink",
    info: "The reduction reflects earlier testing, tighter story slices, and reuse of proven implementation patterns. Problems were found closer to the change that caused them, so fewer completed epics required rework.",
    href: "/insights?metric=defects-rework",
    points: "0,3 18,11 36,12 54,17 72,22 90,28 108,32 126,39 144,45 162,47 180,51 198,57",
  },
  {
    name: "Flow Predictability",
    description: "PPF Predicted vs Realized value (1–10 scale)",
    baseline: "5.8/10",
    baselineUnit: "(58%)",
    after: "9.1/10",
    afterUnit: "(91%)",
    change: "+57%",
    direction: "up",
    tone: "cyan",
    info: "Predictability improved as smaller stories produced better estimates and the team removed blockers earlier. The lower amount of unplanned work also meant committed scope was less often displaced during the quarter.",
    href: "/insights?metric=flow-predictability",
    points: "0,28 18,26 36,23 54,21 72,17 90,20 108,13 126,14 144,6 162,9 180,2 198,-5",
  },
] as const;

const valueDrivers = [
  ["Earlier Revenue Realization", "Faster delivery of capabilities to market", "$6.8M", "green"],
  ["Engineering Capacity Recovered", "Additional capacity from higher velocity", "$4.2M", "blue"],
  ["Productivity Recovery", "Reduced blocked time and wait time", "$1.3M", "teal"],
  ["Unplanned Scope Deferred", "Late, low-value scope removed from release", "$10K", "orange"],
  ["Quality Cost Avoidance", "Critical defect value protected", "$4M", "purple"],
] as const;

const periodSnapshots = {
  "12": {
    label: "12-MONTH PERIOD",
    periodName: "12 Months",
    range: "May 2024 – Apr 2025",
    baselineRange: "May 2023 – Apr 2024",
    total: "$16.31M",
    driverValues: ["$6.8M", "$4.2M", "$1.3M", "$10K", "$4M"],
    top: { "Total Estimated Value": "$16.31M", "Revenue Impact": "$6.8M", "Capacity Recovered": "$4.2M", "Productivity Recovered": "$1.3M", "Cost Avoidance": "$4M", "Unplanned Work Reduction": "$10K" },
    flow: {
      "Flow Velocity": { baseline: "95", after: "145", change: "+53%", direction: "up", points: "0,18 18,12 36,19 54,9 72,13 90,2 108,7 126,-3 144,2 162,-7 180,-2 198,-14" },
      "Flow Time": { baseline: "240", after: "95", change: "-60%", direction: "down", points: "0,2 18,6 36,10 54,16 72,18 90,25 108,28 126,35 144,38 162,46 180,51 198,57" },
      "Flow Efficiency": { baseline: "24%", after: "46%", change: "+92%", direction: "up", points: "0,29 18,23 36,20 54,19 72,13 90,17 108,10 126,12 144,5 162,2 180,-6 198,-13" },
      "Blocked Time": { baseline: "15", after: "3", change: "-80%", direction: "down", points: "0,1 18,10 36,16 54,21 72,27 90,34 108,35 126,42 144,44 162,49 180,51 198,58" },
      "Defects & Rework": { baseline: "7", after: "3", change: "-57%", direction: "down", points: "0,3 18,11 36,12 54,17 72,22 90,28 108,32 126,39 144,45 162,47 180,51 198,57" },
      "Flow Predictability": { baseline: "5.8/10", after: "9.1/10", change: "+57%", direction: "up", points: "0,28 18,26 36,23 54,21 72,17 90,20 108,13 126,14 144,6 162,9 180,2 198,-5" },
    },
  },
  "6": {
    label: "6-MONTH PERIOD",
    periodName: "6 Months",
    range: "Nov 2024 – Apr 2025",
    baselineRange: "May 2024 – Oct 2024",
    total: "$8.31M",
    driverValues: ["$3.4M", "$2.2M", "$0.7M", "$10K", "$2M"],
    top: { "Total Estimated Value": "$8.31M", "Revenue Impact": "$3.4M", "Capacity Recovered": "$2.2M", "Productivity Recovered": "$0.7M", "Cost Avoidance": "$2M", "Unplanned Work Reduction": "$10K" },
    flow: {
      "Flow Velocity": { baseline: "82", after: "121", change: "+48%", direction: "up", points: "0,23 18,18 36,20 54,12 72,15 90,8 108,11 126,3 144,6 162,-1 180,2 198,-9" },
      "Flow Time": { baseline: "198", after: "108", change: "-45%", direction: "down", points: "0,6 18,9 36,15 54,18 72,23 90,27 108,31 126,36 144,40 162,44 180,49 198,54" },
      "Flow Efficiency": { baseline: "29%", after: "41%", change: "+41%", direction: "up", points: "0,29 18,25 36,22 54,23 72,17 90,20 108,14 126,16 144,10 162,8 180,2 198,-3" },
      "Blocked Time": { baseline: "11", after: "4", change: "-64%", direction: "down", points: "0,4 18,12 36,17 54,23 72,27 90,32 108,37 126,41 144,45 162,48 180,51 198,55" },
      "Defects & Rework": { baseline: "6", after: "3", change: "-50%", direction: "down", points: "0,5 18,11 36,15 54,20 72,25 90,29 108,34 126,38 144,43 162,46 180,50 198,55" },
      "Flow Predictability": { baseline: "6.4/10", after: "8.7/10", change: "+36%", direction: "up", points: "0,27 18,25 36,23 54,20 72,22 90,16 108,15 126,11 144,8 162,10 180,3 198,-1" },
    },
  },
  "3": {
    label: "3-MONTH PERIOD",
    periodName: "3 Months",
    range: "Feb 2025 – Apr 2025",
    baselineRange: "Nov 2024 – Jan 2025",
    total: "$4.85M",
    driverValues: ["$1.8M", "$1M", "$0.3M", "$10K", "$1.74M"],
    top: { "Total Estimated Value": "$4.85M", "Revenue Impact": "$1.8M", "Capacity Recovered": "$1M", "Productivity Recovered": "$0.3M", "Cost Avoidance": "$1.74M", "Unplanned Work Reduction": "$10K" },
    flow: {
      "Flow Velocity": { baseline: "104", after: "137", change: "+32%", direction: "up", points: "0,22 18,17 36,19 54,12 72,14 90,8 108,10 126,3 144,5 162,0 180,1 198,-7" },
      "Flow Time": { baseline: "142", after: "88", change: "-38%", direction: "down", points: "0,8 18,12 36,16 54,20 72,23 90,29 108,31 126,37 144,41 162,45 180,49 198,53" },
      "Flow Efficiency": { baseline: "34%", after: "48%", change: "+41%", direction: "up", points: "0,27 18,24 36,22 54,20 72,16 90,18 108,12 126,13 144,8 162,5 180,1 198,-5" },
      "Blocked Time": { baseline: "8", after: "3", change: "-63%", direction: "down", points: "0,5 18,12 36,19 54,23 72,29 90,34 108,38 126,42 144,46 162,49 180,52 198,56" },
      "Defects & Rework": { baseline: "5", after: "2", change: "-60%", direction: "down", points: "0,7 18,12 36,17 54,22 72,26 90,30 108,35 126,39 144,43 162,47 180,51 198,55" },
      "Flow Predictability": { baseline: "7.2/10", after: "9.2/10", change: "+28%", direction: "up", points: "0,24 18,22 36,20 54,17 72,19 90,13 108,12 126,8 144,6 162,8 180,2 198,-4" },
    },
  },
} as const;

type PeriodKey = keyof typeof periodSnapshots;

function MetricIcon({ kind }: { kind: string }) {
  const common = { width: 29, height: 29, viewBox: "0 0 32 32", fill: "none" };
  if (kind === "money") return <svg {...common}><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" /><path d="M20.5 12.5c-.9-1-2.2-1.5-3.7-1.5-2.1 0-3.8 1-3.8 2.5 0 3.7 7.5 1.3 7.5 5 0 1.5-1.4 2.5-3.8 2.5-1.5 0-2.9-.6-3.8-1.7M16.5 8v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  if (kind === "team") return <svg {...common}><circle cx="16" cy="11" r="4" stroke="currentColor" strokeWidth="2" /><path d="M8 25c.7-4 3.2-6 8-6s7.3 2 8 6M7 16c-2.3.4-3.7 1.7-4 4M25 16c2.3.4 3.7 1.7 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  if (kind === "clock") return <svg {...common}><circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2" /><path d="M16 9v7l5 3M8 5l-3 3M24 5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  if (kind === "shield") return <svg {...common}><path d="M16 4l10 4v7c0 6-4 10-10 13C10 25 6 21 6 15V8l10-4z" stroke="currentColor" strokeWidth="2" /><path d="M11.5 16l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (kind === "clipboard") return <svg {...common}><rect x="7" y="6" width="18" height="22" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M12 6V4h8v2M11 13h10M11 18h7M11 23h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  return <svg {...common}><path d="M5 24V11h6v13M13 24V6h6v18M21 24v-9h6v9" stroke="currentColor" strokeWidth="2" /><path d="M5 7l6-3 5 3 9-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function InfoLink({ href }: { href: string }) {
  return <a className="executive-info-link" href={href} aria-label="Open live metric insight">i</a>;
}

function HoverDetail({ text }: { text: string }) {
  return <span className="metric-hover-detail" role="tooltip">{text}</span>;
}

function TopMetric({ metric, value, periodName }: { metric: (typeof topMetrics)[number]; value: string; periodName: string }) {
  return (
    <article className={`executive-top-metric ${metric.tone}`} tabIndex={0}>
      <div className="executive-icon"><MetricIcon kind={metric.icon} /></div>
      <div className="executive-top-copy">
        <span className="executive-metric-label">{metric.label}</span>
        <strong>{value}</strong>
        <span>{metric.label === "Total Estimated Value" ? `Total Value Realized Over ${periodName}` : metric.detail}</span>
      </div>
      <InfoLink href={metric.href} />
      <HoverDetail text={metric.info} />
    </article>
  );
}

function MiniTrend({ points, tone }: { points: string; tone: string }) {
  return (
    <svg className={`mini-trend ${tone}`} viewBox="0 0 198 60" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} transform="translate(0 1)" />
      <circle cx={points.split(" ").at(-1)?.split(",")[0]} cy={points.split(" ").at(-1)?.split(",")[1]} r="2.5" />
    </svg>
  );
}

function FlowMetricRow({ metric, snapshot }: { metric: (typeof flowMetrics)[number]; snapshot: { baseline: string; after: string; change: string; direction: "up" | "down"; points: string } }) {
  const values = { ...metric, ...snapshot };
  return (
    <article className={`flow-metric-row ${metric.tone}`} tabIndex={0}>
      <div className="flow-metric-name">
        <span className="flow-metric-icon"><MetricIcon kind={metric.name === "Flow Velocity" ? "value" : metric.name === "Flow Time" ? "clock" : metric.name === "Flow Efficiency" ? "money" : metric.name === "Blocked Time" ? "shield" : metric.name === "Defects & Rework" ? "clipboard" : "team"} /></span>
        <span><strong>{metric.name}</strong><small>{metric.description}</small></span>
      </div>
      <div className="flow-metric-number"><strong>{values.baseline}</strong><small>{metric.baselineUnit}</small></div>
      <div className="flow-metric-number"><strong>{values.after}</strong><small>{metric.afterUnit}</small></div>
      <div className="flow-metric-change"><strong>{values.direction === "up" ? "▲" : "▼"} {values.change}</strong></div>
      <div className="flow-trend"><MiniTrend points={values.points} tone={metric.tone} /></div>
      <InfoLink href={metric.href} />
      <HoverDetail text={metric.info} />
    </article>
  );
}

function ValueDonut({ total }: { total: string }) {
  return (
    <div className="value-donut" aria-label="Business value realized over twelve months">
      <div className="value-donut-center"><strong>{total}</strong><span>TOTAL VALUE<br />REALIZED</span></div>
    </div>
  );
}

export function ExecutiveDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("12");
  const currentPeriod = periodSnapshots[selectedPeriod];

  return (
    <main className="executive-shell">
      <header className="executive-header">
        <div>
          <h1>EXECUTIVE DELIVERY VALUE DASHBOARD</h1>
          <p>Turning Team Delivery Metrics into Measurable Executive Insights</p>
        </div>
        <label className="executive-period"><span className="calendar-symbol">▣</span><span><strong>DATE RANGE</strong><small>{currentPeriod.range}</small></span><select value={selectedPeriod} onChange={(event) => setSelectedPeriod(event.target.value as PeriodKey)} aria-label="Select dashboard date range"><option value="12">12 months</option><option value="6">6 months</option><option value="3">3 months</option></select></label>
        <div className="key-takeaway"><span>★</span><span><strong>KEY TAKEAWAY</strong><small>Significant improvement across all key delivery<br />metrics driving measurable business value.</small></span></div>
      </header>

      <section className="executive-top-metrics" aria-label="Estimated business value metrics">
        {topMetrics.map((metric) => <TopMetric key={metric.label} metric={metric} value={currentPeriod.top[metric.label as keyof typeof currentPeriod.top]} periodName={currentPeriod.periodName} />)}
      </section>

      <section className="executive-middle-grid">
        <div className="executive-panel flow-panel">
          <h2>FLOW METRICS – PERIOD COMPARISON</h2>
          <div className="flow-table-head"><span>METRIC</span><span>BASELINE<small>({currentPeriod.baselineRange})</small></span><span>SELECTED PERIOD<small>({currentPeriod.range})</small></span><span>CHANGE</span><span>TREND (MONTHLY)</span></div>
          <div className="flow-table-body">{flowMetrics.map((metric) => <FlowMetricRow key={metric.name} metric={metric} snapshot={currentPeriod.flow[metric.name]} />)}</div>
        </div>

        <div className="executive-panel value-panel">
          <h2>BUSINESS VALUE REALIZED (12 MONTHS)</h2>
          <div className="donut-and-legend"><ValueDonut total={currentPeriod.total} /><div className="value-legend">{valueDrivers.map(([name, , , tone], index) => <div key={name}><i className={tone} /><strong>{name}</strong><b>{currentPeriod.driverValues[index]}</b></div>)}</div></div>
          <div className="driver-table"><div className="driver-table-head"><strong>VALUE BY DRIVER</strong><span>(Using Executive Value Formulas)</span><b>ESTIMATED VALUE</b></div>{valueDrivers.map(([name, description, , tone], index) => <div className="driver-row" key={name}><i className={tone}><MetricIcon kind={tone === "green" ? "money" : tone === "blue" ? "team" : tone === "teal" ? "clock" : tone === "orange" ? "clipboard" : "shield"} /></i><span><strong>{name}</strong><small>{description}</small></span><b>{currentPeriod.driverValues[index]}</b></div>)}<div className="driver-total"><strong>TOTAL ESTIMATED BUSINESS VALUE</strong><b>{currentPeriod.total}</b></div></div>
        </div>
      </section>

      <section className="executive-footer-panel">
        <div><h3>KEY ASSUMPTIONS</h3><ul><li>Evaluated across multiple teams</li><li>Fully Loaded Annual Engineer Cost: $150K</li><li>Time Horizon: 4 Fiscal Quarters</li></ul></div>
        <div className="data-sources"><h3>DATA SOURCES</h3><div><span className="source-logo jira">◆</span> Jira <span className="source-logo azure">◀</span> Azure DevOps <span className="source-logo service">●</span> ServiceNow</div></div>
        <div><h3>NOTES</h3><p>All metrics are median (unless noted). Predictability is measured on a 1–10 scale. Business value estimates are directional and based on industry benchmarks and standard assumptions.</p></div>
      </section>
    </main>
  );
}
