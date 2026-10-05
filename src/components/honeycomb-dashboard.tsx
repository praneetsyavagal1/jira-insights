"use client";

import { useEffect, useState } from "react";

type MetricTone = "purple" | "red" | "blue" | "green" | "orange";

type Metric = {
  id: string;
  title: string;
  value: string;
  valueLabel: string;
  tone: MetricTone;
  available: boolean;
  executiveFinding: string;
  calculation: string;
  evidence: string[];
  interpretation: string[];
  actions: string[];
  caveat: string;
};

type ExecutiveAgentResponse = {
  source: "openai" | "curated";
  model: string | null;
  narrative: Pick<Metric, "executiveFinding" | "calculation" | "evidence" | "interpretation" | "actions" | "caveat"> | null;
  fallbackReason?: string;
};

const analyzedMetrics: Record<string, Metric> = {
  velocity: {
    id: "velocity",
    title: "Flow Velocity",
    value: "+40%",
    valueLabel: "Delivery throughput improvement",
    tone: "purple",
    available: true,
    executiveFinding:
      "Sprint 7 delivered 56 completed story points versus the Sprint 1 baseline of 40: 16 additional points and a 40% increase in measured throughput.",
    calculation: "(56 - 40) / 40 = 40% improvement",
    evidence: [
      "Sprint 1 sprint report: 40 completed story points.",
      "Sprint 7 sprint report: 56 completed story points.",
      "DASH-8 and DASH-14 recorded Co-Pilot IDE in Jira's AI Tool field.",
      "The two AI-assisted stories account for 16 points, or 28.6% of Sprint 7 delivery.",
    ],
    interpretation: [
      "The team created 40% more completed capacity relative to the agreed baseline.",
      "AI use coincided with the increase, but the two-sprint comparison does not establish causation or prove a sustained trend.",
    ],
    actions: [
      "Launch a controlled enterprise AI enablement program across Agile teams, beginning with roles and work types comparable to DASH-8 and DASH-14.",
      "Fund licensing in stages and release the next tranche only when adoption, throughput, escaped defects, cycle time, and developer experience move together.",
      "Create approved usage patterns, security guardrails, training, and reusable prompts so licenses translate into consistent delivery practices.",
      "Review AI-assisted versus non-assisted delivery quarterly and report incremental capacity alongside license cost to establish an auditable return on investment.",
    ],
    caveat: "Association, not causation: the current evidence compares two sprints and two AI-tagged stories.",
  },
  cost: {
    id: "cost",
    title: "Defect Cost Avoidance",
    value: "$4M",
    valueLabel: "Modeled customer value protected",
    tone: "red",
    available: true,
    executiveFinding:
      "Remediating Critical production defect DASH-18 protects a modeled $4M of customer value, while excluding false-positive DASH-19 keeps quality reporting focused on real business impact.",
    calculation: "800 affected customers x $5,000 modeled value = $4,000,000",
    evidence: [
      "DASH-18 is Critical and records 800 affected customers in production release 1.1.2.",
      "DASH-17 is the corrective action story for DASH-18.",
      "DASH-15 carries the $5,000 business-value assumption used by this POC.",
      "DASH-19 is identified as a false positive with no external-customer business impact.",
    ],
    interpretation: [
      "Customer exposure makes DASH-18 financially material and supports immediate remediation.",
      "Counting DASH-19 as an actionable defect would overstate quality risk and could mislead executive and audit reporting.",
    ],
    actions: [
      "Introduce an evidence gate before a defect enters executive or audit metrics: confirm reproducibility, affected customers, severity, business impact, and production version.",
      "Report false positives separately from confirmed customer-impacting defects so quality trends remain transparent without inflating failure rates.",
      "Require every Critical customer-impacting defect to link to a corrective story, accountable owner, target release, and value-at-risk estimate.",
      "Provide auditors with a traceable defect disposition log showing who validated impact, what evidence was reviewed, and why exclusions were approved.",
    ],
    caveat: "$4M is modeled value protected under the POC assumption; it is not recognized accounting savings.",
  },
  unplanned: {
    id: "unplanned",
    title: "Unplanned Work Reduction",
    value: "$500K",
    valueLabel: "Committed release value protected",
    tone: "orange",
    available: true,
    executiveFinding:
      "Product Management identified $10K of late scope for deferral from release 1.2.0, protecting focus on Critical DASH-20 and its $500K modeled business value.",
    calculation: "$10,000 of late scope identified for deferral; DASH-20 value is 50x DASH-21",
    evidence: [
      "DASH-20: Critical, Date 1 set to October 1, and $500K business value.",
      "DASH-21: Date 1 set to November 2, 2026, and $10K business value.",
      "Live Jira shows DASH-21 at Medium priority and still assigned to FixVersion 1.2.0; removal is the stated Product Management decision to execute.",
    ],
    interpretation: [
      "Executing the decision will prevent a late, lower-value request from displacing committed work during the final phase.",
      "The metric represents late scope avoided, not the full $490K difference between the two epics.",
    ],
    actions: [
      "Establish a joint Business Sponsor and Product Management release gate with a clear cutoff date for adding scope.",
      "Require every late request to state business value, customer impact, urgency, delivery effort, and the committed item it would displace.",
      "Use a visible exception register so accepted scope changes have an accountable sponsor and deferred requests return to the next planning cycle.",
      "Review scope churn and value displaced each quarter to identify where earlier sponsor alignment or discovery would reduce unplanned work.",
    ],
    caveat: "The $10K reduction is not realized until DASH-21 is removed from FixVersion 1.2.0; live Jira still shows the version assignment.",
  },
  demand: {
    id: "demand",
    title: "Demand vs Capacity",
    value: "$10K",
    valueLabel: "Modeled value margin",
    tone: "blue",
    available: true,
    executiveFinding:
      "DASH-2 balances a $100K business feature against a $90K modeled technical-debt burden; its 10 child items consist of 7 Stories and 3 Tasks.",
    calculation: "$75K team cost + $15K vulnerability exposure = $90K debt burden",
    evidence: [
      "Live Jira query: DASH-2 contains 7 Stories and 3 Tasks, a 70% / 30% work-type split.",
      "DASH-2 has a supplied business value of $100K.",
      "Quarterly development-team cost is assumed to be $75K.",
      "Vulnerability exposure is $10K Highly Critical plus $5K Medium, totaling $15K.",
    ],
    interpretation: [
      "The modeled technical-debt burden consumes 90% of the feature's value, leaving only a $10K value margin.",
      "Issue count describes work mix, not effort allocation; story points or hours are needed before concluding that 30% of capacity is spent on debt.",
    ],
    actions: [
      "Create two explicit capacity lanes: keep the primary team focused on high-value customer features and establish a lower-cost offshore squad for bounded technical-debt work.",
      "Start with a controlled pilot covering vulnerability remediation, platform upgrades, and repeatable maintenance, with security, quality, and knowledge-transfer gates.",
      "Compare the offshore squad's fully loaded cost, remediation lead time, escaped defects, and SLA performance against the current $75K quarterly baseline.",
      "Retain architecture ownership and prioritization with the core team so cost optimization does not create new operational or security risk.",
    ],
    caveat: "The $90K figure combines a supplied team-cost assumption and modeled vulnerability exposure; it is directional, not booked spend.",
  },
};

const unavailable = (
  id: string,
  title: string,
  tone: MetricTone,
  action: string,
  caveat = "Displayed as XX to avoid presenting illustrative data as measured evidence.",
): Metric => ({
  id,
  title,
  value: "XX",
  valueLabel: "Metric pending calibration",
  tone,
  available: false,
  executiveFinding: "No approved annual value is available for this metric.",
  calculation: "Pending calibration",
  evidence: [],
  interpretation: [],
  actions: [action],
  caveat,
});

const pendingMetrics: Record<string, Metric> = {
  revenue: unavailable("revenue", "Revenue Impact", "blue", "Calibrate release dates and realized revenue before publishing this value."),
  capacity: unavailable("capacity", "Capacity Recovered", "green", "Translate incremental throughput into validated team capacity and cost before publishing this value."),
  productivity: unavailable("productivity", "Productivity Recovered", "orange", "Measure blocked and waiting time before assigning a productivity value."),
  "flow-time": unavailable("flow-time", "Flow Time", "orange", "Define start and finish states consistently before publishing this metric."),
  efficiency: unavailable("efficiency", "Flow Efficiency", "green", "Capture active time and waiting time consistently before publishing this metric."),
  blocked: unavailable("blocked", "Blocked Time", "blue", "Standardize blocker status and aging rules before publishing this metric."),
  defects: unavailable("defects", "Defects & Rework", "red", "Separate confirmed customer-impacting defects from false positives before aggregation.", "Defect Cost Avoidance is analyzed separately; this aggregate metric remains XX."),
  predictability: unavailable("predictability", "Flow Predictability", "blue", "Agree a forecast-versus-actual formula before publishing this metric."),
};

const metricCatalog: Record<string, Metric> = {
  ...pendingMetrics,
  ...analyzedMetrics,
};

const valueCards = [
  { id: "revenue", title: "Revenue Impact", subtitle: "From Earlier Revenue Realization", caption: "Faster delivery of capabilities to market", icon: "trend", tone: "blue" },
  { id: "capacity", title: "Capacity Recovered", subtitle: "Engineering Capacity Gained", caption: "More value delivered from higher velocity", icon: "people", tone: "teal" },
  { id: "productivity", title: "Productivity Recovered", subtitle: "From Reduced Blocking & Wait Time", caption: "Less time lost to blockers and waiting", icon: "gauge", tone: "orange" },
  { id: "cost", title: "Defect Cost Avoidance", subtitle: "Modeled Customer Value Protected", caption: "Fewer defects, less rework and support cost", icon: "shield", tone: "green" },
  { id: "unplanned", title: "Unplanned Work Reduction", subtitle: "Committed Release Value Protected", caption: "Less firefighting and context switching", icon: "shuffle", tone: "purple" },
] as const;

const deliveryRows = [
  { id: "velocity", name: "Flow Velocity", description: "Completed work per sprint", baseline: "40", current: "56", unit: "Story Points", change: "+40%", trend: [40, 42, 45, 44, 50, 56] },
  { id: "flow-time", name: "Flow Time", description: "Median lead time for completed epics (calendar days)", unit: "days" },
  { id: "efficiency", name: "Flow Efficiency", description: "Active time / lead time", unit: "%" },
  { id: "blocked", name: "Blocked Time", description: "Median days blocked per completed epic", unit: "days" },
  { id: "defects", name: "Defects & Rework", description: "Escaped defects per completed epic", unit: "defects/epic" },
  { id: "predictability", name: "Flow Predictability", description: "PI objectives achieved (1-10 scale)", unit: "score" },
] as const;

const programNames: Record<string, string> = {
  sce: "Spanish Customer Expansion",
  p2: "Program 2",
  p3: "Program 3",
};

function DashboardIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    money: <><path d="M12 2v20"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4a3 3 0 0 1 0 6M21 20c0-2.6-1.6-4.8-4-5.6"/></>,
    gauge: <><path d="m12 14 4-4"/><path d="M4 18a9 9 0 1 1 16 0"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/></>,
    shuffle: <><path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4"/><path d="m18 4 3 3-3 3M18 14l3 3-3 3"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function VelocitySparkline() {
  return <svg className="delivery-sparkline" viewBox="0 0 150 42" role="img" aria-label="Velocity increased from 40 to 56"><defs><linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f6fe0" stopOpacity=".25"/><stop offset="1" stopColor="#1f6fe0" stopOpacity="0"/></linearGradient></defs><path d="M4 36 L31 31 L58 24 L85 27 L112 14 L146 5 L146 40 L4 40 Z" fill="url(#spark-fill)"/><polyline points="4,36 31,31 58,24 85,27 112,14 146,5" fill="none" stroke="#1f6fe0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="146" cy="5" r="3.5" fill="#1f6fe0"/></svg>;
}

function DemandPanel({ hasData, programName, onOpen }: { hasData: boolean; programName: string; onOpen: () => void }) {
  const [selectedFeature, setSelectedFeature] = useState("digital");
  const hasFeatureData = hasData && selectedFeature === "digital";

  return (
    <section className="reference-panel demand-capacity-panel">
      <header className="reference-panel-head demand-capacity-head">
        <div>
          <span className="reference-label">Team Capacity Allocation - Based on Work Type</span>
          <div className="panel-title-with-info"><h2>Demand vs Capacity</h2><button type="button" className="metric-info-button inline" onClick={onOpen} aria-label="Open Demand vs Capacity insight">i</button></div>
        </div>
        <div className="margin-chip"><strong>{hasData ? "$10K" : "XX"}</strong><span>Modeled Value Margin</span></div>
      </header>

      {!hasData ? <div className="reference-empty-state"><strong>XX</strong><p>No Demand vs Capacity analysis has been prepared for {programName} in this period.</p><small>Connect and calibrate the program&apos;s Jira work mix, team cost, and business-value assumptions.</small></div> : <div className="demand-capacity-body">
        <section className="work-type-section">
          <div className="work-type-header"><h3>Work Type Mix</h3><label><span>Program Features</span><select value={selectedFeature} onChange={(event) => setSelectedFeature(event.target.value)}><option value="digital">Digital Platforms</option><option value="care">Customer Care Support</option><option value="atm">Enabling the ATM Fleet</option><option value="tx">Branch Operations - TX</option><option value="ca">Branch Operations - CA</option></select></label></div>
          {hasFeatureData ? <div className="reference-work-mix"><div className="reference-donut" role="img" aria-label="10 items: 7 Stories and 3 Tasks"><div><strong>10</strong><span>items</span></div></div><ul><li><i className="stories"/><div><strong>7 Stories</strong><span>70% business features</span></div></li><li><i className="tasks"/><div><strong>3 Tasks</strong><span>30% technical debt</span></div></li></ul></div> : <div className="feature-empty"><strong>XX</strong><p>No work-type data for this feature yet.</p></div>}
          <p className="reference-fine-print">Count of Jira child items; not an effort allocation.</p>
        </section>

        <div className="demand-card-grid">
          <article className="demand-data-card"><h3>Quarterly Value Economics</h3><div className="reference-economics"><div><span>Business feature value</span><strong className="positive-number">$100K</strong></div><div><span>Development-team cost</span><strong className="negative-number">-$75K</strong></div><div><span>Vulnerability exposure</span><strong className="negative-number">-$15K</strong></div><div className="total"><span>Modeled value margin</span><strong>$10K</strong></div></div><div className="economics-bar"><i/><i/><i/></div><div className="economics-key"><span>Cost 75%</span><span>Exposure 15%</span><span>Margin 10%</span></div></article>
          <article className="demand-data-card"><div className="demand-card-title"><h3>Backlog vs Burn Rate</h3><span>Pending</span></div><div className="reference-economics"><div><span>Total Backlog Size</span><strong>XX</strong></div><div><span>Baseline Velocity</span><strong>40 pts</strong></div><div><span>Target Milestone Date</span><strong>Dec 31, 2026</strong></div><div className="total"><span>Current Team Size</span><strong>XX</strong></div></div></article>
        </div>
        <div className="reference-decision"><strong>Executive decision</strong><p>Test a lower-cost offshore technical-debt squad while preserving architecture, security, and prioritization ownership with the core team.</p></div>
      </div>}
    </section>
  );
}

function MetricDetail({
  metric,
  onClose,
  hasApprovedData,
  agentResult,
  isLoading,
}: {
  metric: Metric;
  onClose: () => void;
  hasApprovedData: boolean;
  agentResult?: ExecutiveAgentResponse;
  isLoading: boolean;
}) {
  const hasData = hasApprovedData && metric.available;
  const sourceLabel = isLoading
    ? "CHECKING OPENAI AGENT"
    : agentResult?.source === "openai"
      ? "OPENAI AGENT INSIGHT"
      : "CURATED JIRA-GROUNDED INSIGHT";
  return (
    <aside className="honey-detail" role="dialog" aria-modal="true" aria-label={`${metric.title} executive insight`} aria-live="polite">
      <button type="button" className="honey-back" onClick={onClose}>Close insight <span aria-hidden="true">×</span></button>
      <span className={`honey-badge ${metric.tone}`}>{hasData ? sourceLabel : "METRIC PENDING"}</span>
      <h2>{metric.title}</h2>
      <strong className={`detail-value ${metric.tone}`}>{hasData ? metric.value : "XX"}</strong>
      {hasData && <span className="detail-value-label">{metric.valueLabel}</span>}
      <p className="honey-summary">{hasData ? metric.executiveFinding : "No approved value is available for the selected annual period. The dashboard intentionally shows XX instead of invented data."}</p>

      {hasData && <>
        <section className="honey-detail-section calculation"><h3>Calculation</h3><p>{metric.calculation}</p></section>
        <section className="honey-detail-section purple"><h3>Jira evidence</h3><ul>{metric.evidence.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="honey-detail-section blue"><h3>Executive interpretation</h3><ul>{metric.interpretation.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section className="honey-detail-section green"><h3>Recommended executive actions</h3><ol>{metric.actions.map((item) => <li key={item}>{item}</li>)}</ol></section>
      </>}
      <div className="detail-caveat"><strong>Evidence boundary</strong><span>{hasData ? metric.caveat : "Historical evidence is pending calibration."}</span></div>
      {hasData && <div className={`detail-source ${agentResult?.source === "openai" ? "openai" : "curated"}`}>
        <strong>Narrative source</strong>
        <span>{isLoading
          ? "Loading the optional OpenAI narrative; curated content remains visible meanwhile."
          : agentResult?.source === "openai"
            ? `OpenAI Responses API${agentResult.model ? ` - ${agentResult.model}` : ""}`
            : agentResult?.fallbackReason ?? "Curated content is active; no OpenAI call is required."}</span>
      </div>}
    </aside>
  );
}

export function HoneycombDashboard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState("sce");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [tableView, setTableView] = useState<"both" | "baseline" | "current">("both");
  const [agentResults, setAgentResults] = useState<Record<string, ExecutiveAgentResponse>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const isCurrentYear = selectedYear === "2026";
  const hasApprovedData = isCurrentYear && selectedProgram === "sce";
  const programName = programNames[selectedProgram];
  const baseActiveMetric = activeId ? metricCatalog[activeId] : undefined;
  const activeAgentResult = activeId ? agentResults[activeId] : undefined;
  const activeMetric = baseActiveMetric && activeAgentResult?.narrative
    ? { ...baseActiveMetric, ...activeAgentResult.narrative }
    : baseActiveMetric;

  useEffect(() => {
    if (!activeId) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeId]);

  async function openInsight(id: string) {
    setActiveId(id);
    if (!hasApprovedData || !analyzedMetrics[id] || agentResults[id] || loadingId === id) return;

    setLoadingId(id);
    try {
      const response = await fetch(`/api/insights/executive?scenario=${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Insight request failed (${response.status}).`);
      const result = await response.json() as ExecutiveAgentResponse;
      setAgentResults((current) => ({ ...current, [id]: result }));
    } catch {
      setAgentResults((current) => ({
        ...current,
        [id]: {
          source: "curated",
          model: null,
          narrative: null,
          fallbackReason: "The optional agent request was unavailable, so curated content is shown.",
        },
      }));
    } finally {
      setLoadingId((current) => current === id ? null : current);
    }
  }

  return (
    <main className="executive-insights-shell">
      <header className="reference-masthead">
        <div className="reference-brand"><span>DELIVERY INTELLIGENCE</span><h1>Executive Insights Dashboard</h1><p>The &quot;Story&quot; behind Story Points</p></div>
        <label className="reference-filter"><span>Program Name</span><select value={selectedProgram} onChange={(event) => { setSelectedProgram(event.target.value); setActiveId(null); }}><option value="sce">Spanish Customer Expansion</option><option value="p2">Program 2</option><option value="p3">Program 3</option></select></label>
        <label className="reference-filter period"><span>12-Month Period</span><select value={selectedYear} onChange={(event) => { setSelectedYear(event.target.value); setActiveId(null); }}><option value="2026">Jan 1 - Dec 31, 2026</option><option value="2025">Jan 1 - Dec 31, 2025</option><option value="2024">Jan 1 - Dec 31, 2024</option></select></label>
      </header>

      {!hasApprovedData && <div className="reference-data-notice"><strong>No approved data for {programName} in {selectedYear}.</strong><span>Values remain XX until this program and period are connected and calibrated.</span></div>}

      <section className="reference-kpi-strip" aria-label="Value summary">
        <article className="reference-kpi-card total"><div className="reference-kpi-icon"><DashboardIcon name="money" /></div><div><span className="status-pill">{hasApprovedData ? "2 of 5 approved" : "0 of 5 approved"}</span><h2>Total Estimated Value</h2><strong>XX</strong><p>Approved to date: <b>{hasApprovedData ? "$4.5M" : "XX"}</b></p></div></article>
        {valueCards.map((card) => {
          const metric = metricCatalog[card.id];
          const approved = hasApprovedData && metric.available;
          return <article key={card.id} className={`reference-kpi-card ${card.tone} ${approved ? "approved" : "pending"}`}><button type="button" className="metric-info-button" onClick={() => openInsight(card.id)} aria-label={`Open ${card.title} insight`}>i</button><div className="reference-kpi-icon"><DashboardIcon name={card.icon} /></div><div><span className={`status-pill ${approved ? "approved" : "pending"}`}>{approved ? "Analyzed" : "Pending"}</span><h2>{card.title}</h2><strong>{approved ? metric.value : "XX"}</strong><p>{card.subtitle}</p><small>{card.caption}</small></div></article>;
        })}
      </section>

      <section className="reference-main-grid">
        <div className="reference-left-column">
          <section className="reference-panel delivery-table-panel">
            <header className="reference-panel-head"><div><span className="reference-label">Delivery performance</span><h2>Program Level Delivery Metrics</h2></div><div className="reference-segmented" aria-label="Columns shown"><button type="button" className={tableView === "both" ? "active" : ""} onClick={() => setTableView("both")}>Both</button><button type="button" className={tableView === "baseline" ? "active" : ""} onClick={() => setTableView("baseline")}>Baseline</button><button type="button" className={tableView === "current" ? "active" : ""} onClick={() => setTableView("current")}>Current</button></div></header>
            <div className="reference-table-wrap"><table className="reference-delivery-table"><thead><tr><th>Metric</th>{tableView !== "current" && <th>Baseline<small>Sprint 1</small></th>}{tableView !== "baseline" && <th>Current<small>Sprint 7</small></th>}<th>Change</th><th>Trend<small>Monthly view</small></th></tr></thead><tbody>{deliveryRows.map((row) => {
              const approved = hasApprovedData && row.id === "velocity";
              return <tr key={row.id} className={approved ? "approved" : "pending"}><td><div className="reference-metric-name"><button type="button" className="metric-info-button inline" onClick={() => openInsight(row.id)} aria-label={`Open ${row.name} insight`}>i</button><div><span className={`status-pill ${approved ? "approved" : "pending"}`}>{approved ? "Analyzed" : "Pending"}</span><strong>{row.name}</strong><small>{row.description}</small></div></div></td>{tableView !== "current" && <td className="reference-value"><strong>{approved && "baseline" in row ? row.baseline : "XX"}</strong><span>{approved ? row.unit : "Pending"}</span></td>}{tableView !== "baseline" && <td className="reference-value current"><strong>{approved && "current" in row ? row.current : "XX"}</strong><span>{approved ? row.unit : "Pending"}</span></td>}<td>{approved && "change" in row ? <span className="change-pill">▲ {row.change}</span> : <span className="pending-chip">XX</span>}</td><td>{approved ? <VelocitySparkline /> : <span className="pending-trend">Pending</span>}</td></tr>;
            })}</tbody></table></div>
          </section>

          <footer className="reference-footer-grid">
            <section className="reference-panel reference-footer-card"><span className="reference-label">Key Assumptions</span><ul><li>Evaluated across multiple teams</li><li>Fully loaded annual engineer cost: $150K</li><li>Quarterly development-team cost: $75K (DASH-2)</li><li>Time horizon: 4 fiscal quarters</li></ul></section>
            <section className="reference-panel reference-footer-card"><span className="reference-label">Data Sources</span><div className="reference-source-chips"><span>Jira</span><span>ServiceNow</span></div><p>Jira board 4174: sprint reports, issue fields, release data, and supplied POC business-value assumptions.</p></section>
          </footer>
        </div>

        <DemandPanel hasData={hasApprovedData} programName={programName} onOpen={() => openInsight("demand")} />
      </section>

      {activeMetric && <><button type="button" className="side-insight-scrim" onClick={() => setActiveId(null)} aria-label="Close insight"/><MetricDetail metric={activeMetric} hasApprovedData={hasApprovedData} agentResult={activeAgentResult} isLoading={loadingId === activeId} onClose={() => setActiveId(null)} /></>}
    </main>
  );
}
