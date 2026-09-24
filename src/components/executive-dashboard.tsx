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

function TopMetric({ metric }: { metric: (typeof topMetrics)[number] }) {
  return (
    <article className={`executive-top-metric ${metric.tone}`} tabIndex={0}>
      <div className="executive-icon"><MetricIcon kind={metric.icon} /></div>
      <div className="executive-top-copy">
        <span className="executive-metric-label">{metric.label}</span>
        <strong>{metric.value}</strong>
        <span>{metric.detail}</span>
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

function FlowMetricRow({ metric }: { metric: (typeof flowMetrics)[number] }) {
  return (
    <article className={`flow-metric-row ${metric.tone}`} tabIndex={0}>
      <div className="flow-metric-name">
        <span className="flow-metric-icon"><MetricIcon kind={metric.name === "Flow Velocity" ? "value" : metric.name === "Flow Time" ? "clock" : metric.name === "Flow Efficiency" ? "money" : metric.name === "Blocked Time" ? "shield" : metric.name === "Defects & Rework" ? "clipboard" : "team"} /></span>
        <span><strong>{metric.name}</strong><small>{metric.description}</small></span>
      </div>
      <div className="flow-metric-number"><strong>{metric.baseline}</strong><small>{metric.baselineUnit}</small></div>
      <div className="flow-metric-number"><strong>{metric.after}</strong><small>{metric.afterUnit}</small></div>
      <div className="flow-metric-change"><strong>{metric.direction === "up" ? "▲" : "▼"} {metric.change}</strong></div>
      <div className="flow-trend"><MiniTrend points={metric.points} tone={metric.tone} /></div>
      <InfoLink href={metric.href} />
      <HoverDetail text={metric.info} />
    </article>
  );
}

function ValueDonut() {
  return (
    <div className="value-donut" aria-label="Business value realized over twelve months">
      <div className="value-donut-center"><strong>$16.31M</strong><span>TOTAL VALUE<br />REALIZED</span></div>
    </div>
  );
}

export function ExecutiveDashboard() {
  return (
    <main className="executive-shell">
      <header className="executive-header">
        <div>
          <h1>EXECUTIVE DELIVERY VALUE DASHBOARD</h1>
          <p>Turning SAFe Flow Metrics into Measurable Business Value</p>
        </div>
        <div className="executive-period"><span className="calendar-symbol">▣</span><span><strong>12-MONTH PERIOD</strong><small>May 2024 – Apr 2025</small></span></div>
        <div className="key-takeaway"><span>★</span><span><strong>KEY TAKEAWAY</strong><small>Significant improvement across all key delivery<br />metrics driving measurable business value.</small></span></div>
      </header>

      <section className="executive-top-metrics" aria-label="Estimated business value metrics">
        {topMetrics.map((metric) => <TopMetric key={metric.label} metric={metric} />)}
      </section>

      <section className="executive-middle-grid">
        <div className="executive-panel flow-panel">
          <h2>SAFe FLOW METRICS – 12 MONTH COMPARISON</h2>
          <div className="flow-table-head"><span>METRIC</span><span>BASELINE<small>(May 2023 – Apr 2024)</small></span><span>AFTER 12 MONTHS<small>(May 2024 – Apr 2025)</small></span><span>CHANGE</span><span>TREND (MONTHLY)</span></div>
          <div className="flow-table-body">{flowMetrics.map((metric) => <FlowMetricRow key={metric.name} metric={metric} />)}</div>
        </div>

        <div className="executive-panel value-panel">
          <h2>BUSINESS VALUE REALIZED (12 MONTHS)</h2>
          <div className="donut-and-legend"><ValueDonut /><div className="value-legend">{valueDrivers.map(([name, , value, tone]) => <div key={name}><i className={tone} /><strong>{name}</strong><b>{value}</b></div>)}</div></div>
          <div className="driver-table"><div className="driver-table-head"><strong>VALUE BY DRIVER</strong><span>(Using Executive Value Formulas)</span><b>ESTIMATED VALUE</b></div>{valueDrivers.map(([name, description, value, tone]) => <div className="driver-row" key={name}><i className={tone}><MetricIcon kind={tone === "green" ? "money" : tone === "blue" ? "team" : tone === "teal" ? "clock" : tone === "orange" ? "clipboard" : "shield"} /></i><span><strong>{name}</strong><small>{description}</small></span><b>{value}</b></div>)}<div className="driver-total"><strong>TOTAL ESTIMATED BUSINESS VALUE</strong><b>$16.31M</b></div></div>
        </div>
      </section>

      <section className="executive-footer-panel">
        <div><h3>KEY ASSUMPTIONS</h3><ul><li>3 ARTs, 18 Teams, ~450 Engineers</li><li>Fully loaded annual engineer cost: $150K</li><li>5 PIs per year</li></ul></div>
        <div className="data-sources"><h3>DATA SOURCES</h3><div><span className="source-logo jira">◆</span> Jira Align / Jira <span className="source-logo azure">◀</span> Azure DevOps <span className="source-logo service">●</span> ServiceNow <span className="source-logo power">▮</span> Power BI</div></div>
        <div><h3>NOTES</h3><p>All metrics are median (unless noted). Predictability is measured on a 1–10 scale. Business value estimates are directional and based on industry benchmarks and standard assumptions.</p></div>
      </section>
    </main>
  );
}
