"use client";

import Link from "next/link";

type ScenarioKind = "velocity" | "unplanned" | "defects" | "demand";

type Scenario = {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: "orange" | "purple";
  conclusion: string;
  calculation: string;
  caveat: string;
  jiraBoard: string;
  metrics: Array<{ label: string; value: string; note: string }>;
  insights: Array<{ title: string; body: string }>;
  evidence: Array<{ key: string; value: string; detail: string; href: string }>;
  actionTitle: string;
  actionBody: string;
  actions: string[];
};

const boardUrl = "https://proactionnppoc.ent.cgi.com/jira/secure/RapidBoard.jspa?rapidView=4174&projectKey=DASH&view=planning.nodetail&epics=visible&issueLimit=100";

const scenarios: Record<ScenarioKind, Scenario> = {
  velocity: {
    eyebrow: "SCENARIO INSIGHT - DELIVERY CAPACITY",
    title: "Flow Velocity",
    subtitle: "A measured productivity signal, the AI adoption evidence behind it, and the controls needed before scaling licenses.",
    accent: "purple",
    conclusion: "Sprint 7 delivered 56 points, 16 more than the 40-point Sprint 1 baseline. AI-tagged work represented 28.6% of Sprint 7 delivery, creating a credible case for a controlled licensing investment rather than an unqualified causal claim.",
    calculation: "(56 - 40) / 40 = 40% throughput improvement; 16 / 56 = 28.6% AI-assisted share",
    caveat: "This is a two-sprint comparison. AI use coincided with higher throughput, but the available evidence does not isolate AI as the cause or prove a sustained trend.",
    jiraBoard: boardUrl,
    metrics: [
      { label: "Sprint 1 baseline", value: "40 pts", note: "Completed story points" },
      { label: "Sprint 7 delivery", value: "56 pts", note: "Completed story points" },
      { label: "Measured improvement", value: "+40%", note: "16 additional points" },
      { label: "AI-assisted share", value: "28.6%", note: "16 of 56 Sprint 7 points" },
    ],
    insights: [
      { title: "The baseline is explicit and repeatable", body: "Sprint 1 established 40 completed story points through the Jira sprint report. That gives leadership a stable control point for measuring later changes." },
      { title: "Sprint 7 created measurable incremental capacity", body: "The team completed 56 points in Sprint 7: 16 additional points and a 40% increase over baseline." },
      { title: "AI usage is visible in delivery evidence", body: "DASH-8 and DASH-14 recorded Co-Pilot IDE in the Jira AI Tool field and together account for 16 points. Their contribution is material enough to justify a broader controlled trial." },
      { title: "The investment case needs quality guardrails", body: "Velocity alone cannot demonstrate economic return. License decisions should also track cycle time, escaped defects, rework, adoption, and developer experience." },
    ],
    evidence: [
      { key: "Sprint 1", value: "40 points", detail: "Baseline completed story points from the sprint report", href: boardUrl },
      { key: "Sprint 7", value: "56 points", detail: "Comparison sprint; 40% above baseline", href: boardUrl },
      { key: "DASH-8", value: "AI Tool: Co-Pilot IDE", detail: "Comparable delivered customer transaction story", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-8" },
      { key: "DASH-14", value: "AI Tool: Co-Pilot IDE", detail: "Comparable delivered CRM data story", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-14" },
    ],
    actionTitle: "Scale AI licensing through evidence-based investment gates",
    actionBody: "Establish an enterprise AI enablement program for Agile teams, but connect each funding decision to measurable adoption, productivity, quality, and risk outcomes. This turns licensing from a broad technology expense into a governed capacity investment.",
    actions: [
      "Pilot licenses with teams and work types comparable to DASH-8 and DASH-14, with a documented non-assisted baseline.",
      "Provide approved usage patterns, security controls, training, reusable prompts, and engineering support before measuring results.",
      "Track AI-assisted and non-assisted throughput, cycle time, escaped defects, rework, adoption, and developer experience together.",
      "Release additional license funding only when quarterly evidence demonstrates durable capacity or quality gains that exceed total enablement cost.",
    ],
  },
  defects: {
    eyebrow: "SCENARIO INSIGHT - QUALITY ECONOMICS",
    title: "Defect Cost Avoidance",
    subtitle: "A customer-impact model that separates material production defects from false positives before executive and audit reporting.",
    accent: "purple",
    conclusion: "Correcting DASH-18 protects a modeled $4M of customer value. Excluding DASH-19 from actionable-defect counts prevents a false positive from overstating the bank's quality exposure.",
    calculation: "800 affected customers x $5,000 modeled value per customer = $4,000,000",
    caveat: "$4M is modeled value protected under the POC assumption. It is not booked savings, avoided cash expense, or a validated accounting benefit.",
    jiraBoard: boardUrl,
    metrics: [
      { label: "Customers affected", value: "800", note: "DASH-18 production impact" },
      { label: "Modeled value", value: "$5K", note: "Per-customer POC assumption" },
      { label: "Value protected", value: "$4M", note: "800 x $5,000" },
      { label: "False positives", value: "1", note: "DASH-19 excluded from impact" },
    ],
    insights: [
      { title: "Customer impact creates the priority signal", body: "DASH-18 is Critical and affected 800 customers during production deployment 1.1.2, making it a material customer exposure rather than a simple defect count." },
      { title: "The corrective action has a measurable payoff", body: "DASH-17 is the remediation story for DASH-18. Applying the POC's $5,000 value assumption produces $4M of modeled value protected." },
      { title: "False-positive control protects reporting integrity", body: "DASH-19 has no external-customer business impact. Keeping it separate avoids inflating quality metrics used by executives and auditors." },
      { title: "Traceability is as important as the value", body: "The defect, customer impact, corrective story, release, disposition, and financial assumption must remain linked so the conclusion can be independently reviewed." },
    ],
    evidence: [
      { key: "DASH-15", value: "Epic - $5,000", detail: "POC business-value assumption and release context", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-15" },
      { key: "DASH-17", value: "Corrective action", detail: "Remediation story associated with DASH-18", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-17" },
      { key: "DASH-18", value: "Critical - 800 customers", detail: "Production defect driving the modeled $4M exposure", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-18" },
      { key: "DASH-19", value: "False positive", detail: "No external-customer business impact", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-19" },
    ],
    actionTitle: "Create an audit-ready customer-impact defect standard",
    actionBody: "Only confirmed defects with validated business impact should influence executive customer-risk metrics. False positives remain visible for transparency, but they must be reported as a separate disposition so auditors do not misread them as quality failures.",
    actions: [
      "Require reproducibility, affected-customer count, severity, production version, and business-impact evidence before a defect enters executive metrics.",
      "Report confirmed customer-impacting defects, internal defects, and false positives as separate categories with clear denominators.",
      "Link every Critical defect to a corrective story, accountable owner, target release, and value-at-risk estimate.",
      "Maintain an auditable disposition record showing evidence reviewed, validation owner, decision date, and rationale for every false-positive exclusion.",
    ],
  },
  unplanned: {
    eyebrow: "SCENARIO INSIGHT - FLOW GOVERNANCE",
    title: "Unplanned Work Reduction",
    subtitle: "A release-governance decision that prevented late, low-value scope from displacing higher-value committed work.",
    accent: "orange",
    conclusion: "Product Management identified $10K of late scope for removal from release 1.2.0, preserving focus on Critical DASH-20 and its $500K modeled value. Live Jira still shows the version assignment, so the action remains to be completed.",
    calculation: "$10K late scope identified for deferral; $500K / $10K = 50x relative business value",
    caveat: "The reduction is not realized until DASH-21 is removed from FixVersion 1.2.0. The $490K difference is not a cost saving, and no capacity saving is claimed without effort data.",
    jiraBoard: boardUrl,
    metrics: [
      { label: "Scope to defer", value: "$10K", note: "DASH-21 business value" },
      { label: "Committed value protected", value: "$500K", note: "DASH-20 business value" },
      { label: "Relative value", value: "50x", note: "DASH-20 versus DASH-21" },
      { label: "Release decision", value: "1.2.0", note: "DASH-21 removal pending" },
    ],
    insights: [
      { title: "Timing exposed the scope risk", body: "DASH-20 was defined on October 1 for the assumed start of the final phase. DASH-21 was dated November 2, 2026, when release capacity was less able to absorb change." },
      { title: "Value clarified the trade-off", body: "DASH-20 carries Critical priority and $500K of value; DASH-21 carries $10K. Accepting DASH-21 late would have exposed work worth 50 times more to displacement." },
      { title: "Governance converted churn into a decision", body: "DASH-21 is Medium and the stated decision is to remove it from FixVersion 1.2.0. Live Jira still carries the version, so completing that update is part of the control." },
      { title: "Alignment needs to happen before the cutoff", body: "The strongest long-term control is earlier collaboration among sponsors, Product Management, and delivery teams so valuable demand is shaped before final-phase commitments." },
    ],
    evidence: [
      { key: "DASH-20", value: "Critical - $500K", detail: "Date 1: October 1; retained in release scope", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-20" },
      { key: "DASH-21", value: "Medium - $10K", detail: "Date 1: November 2, 2026; still in 1.2.0 pending the stated removal", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-21" },
    ],
    actionTitle: "Make sponsor alignment the first control against scope creep",
    actionBody: "Create a joint Business Sponsor and Product Management release gate so demand is valued and sequenced before the final-phase cutoff. Late requests should remain visible, but they should enter a committed release only through an explicit, value-based exception decision.",
    actions: [
      "Publish a release scope cutoff and hold sponsor-product alignment sessions before it, focused on business value, customer outcomes, dependencies, and readiness.",
      "Require every late request to state value, urgency, effort, customer impact, and the committed item it would displace.",
      "Maintain a visible exception register with sponsor approval, decision rationale, affected release, and follow-up planning date.",
      "Review quarterly scope churn, late-request value, and value displaced to identify where earlier discovery or sponsor engagement needs improvement.",
    ],
  },
  demand: {
    eyebrow: "SCENARIO INSIGHT - CAPACITY ECONOMICS",
    title: "Demand vs Capacity",
    subtitle: "How DASH-2's work mix and modeled economics reveal the cost of balancing customer features with technical debt.",
    accent: "purple",
    conclusion: "DASH-2 contains 7 Stories and 3 Tasks. A $100K business feature is being weighed against a $90K technical-debt burden, leaving only a $10K modeled value margin.",
    calculation: "$75K quarterly team cost + $10K Highly Critical exposure + $5K Medium exposure = $90K technical-debt burden",
    caveat: "The 70% / 30% split is based on issue count, not effort. The cost and vulnerability values are supplied POC assumptions and should be validated before funding decisions.",
    jiraBoard: boardUrl,
    metrics: [
      { label: "Business features", value: "7", note: "Stories under DASH-2" },
      { label: "Technical-debt items", value: "3", note: "Tasks under DASH-2" },
      { label: "Feature value", value: "$100K", note: "DASH-2 business value" },
      { label: "Debt burden", value: "$90K", note: "$75K team + $15K exposure" },
    ],
    insights: [
      { title: "The live Jira mix is 70% features and 30% debt by count", body: "DASH-2 has 10 child issues: 7 Stories representing business functionality and 3 Tasks representing maintenance, vulnerabilities, and infrastructure work." },
      { title: "Technical debt nearly consumes the modeled feature value", body: "The $75K quarterly team cost and $15K vulnerability exposure total $90K, equal to 90% of the feature's $100K business value." },
      { title: "Issue count is not capacity consumption", body: "Three Tasks may represent more or less than 30% of effort. Story points or hours by work type are needed before changing staffing based on the pie chart alone." },
      { title: "A specialized lower-cost lane can protect feature focus", body: "A bounded offshore technical-debt squad may reduce cost and interruptions, provided architecture, security, quality, and knowledge-transfer controls remain with accountable leaders." },
    ],
    evidence: [
      { key: "DASH-2", value: "$100K - 10 children", detail: "7 Stories and 3 Tasks returned by the live Jira query", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-2" },
      { key: "DASH-22", value: "Highly Critical", detail: "$10K supplied vulnerability exposure assumption", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-22" },
      { key: "DASH-23", value: "Medium", detail: "$5K supplied vulnerability exposure assumption", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-23" },
      { key: "DASH-24", value: "Task", detail: "Database-version maintenance under DASH-2", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-24" },
    ],
    actionTitle: "Pilot a governed offshore technical-debt capacity lane",
    actionBody: "Preserve the primary team's emphasis on high-value customer features by moving suitable, well-bounded technical-debt work to a lower-cost offshore team. Treat this as an operating-model experiment with explicit service levels and stop conditions, not an automatic labor-arbitrage decision.",
    actions: [
      "Define eligible work such as vulnerability remediation, version upgrades, and repeatable maintenance; retain architecture and product prioritization with the core team.",
      "Run a one-quarter pilot with security controls, code-review ownership, documentation standards, overlap hours, and knowledge-transfer requirements.",
      "Compare fully loaded cost, remediation lead time, SLA attainment, escaped defects, and rework against the current $75K quarterly baseline.",
      "Scale only if the pilot creates verified savings or capacity without increasing security, operational, or delivery risk.",
    ],
  },
};

function ArrowIcon() {
  return <span aria-hidden="true">-&gt;</span>;
}

export function ScenarioPage({ kind, onClose }: { kind: ScenarioKind; onClose?: () => void }) {
  const scenario = scenarios[kind];

  return (
    <main className={`scenario-shell ${scenario.accent}`}>
      {onClose ? (
        <button className="scenario-close-button" type="button" onClick={onClose} aria-label="Close metric details">x</button>
      ) : (
        <nav className="scenario-nav"><Link href="/">&lt;- Executive dashboard</Link><Link href="/insights">Live Jira insights</Link></nav>
      )}

      <header className="scenario-hero">
        <div><span className="scenario-eyebrow">{scenario.eyebrow}</span><h1>{scenario.title}</h1><p>{scenario.subtitle}</p></div>
        <a className="board-link" href={scenario.jiraBoard} target="_blank" rel="noreferrer">Open Jira board <ArrowIcon /></a>
      </header>

      <section className="scenario-conclusion"><span className="conclusion-mark">+</span><div><strong>Agent insight</strong><p>{scenario.conclusion}</p></div></section>
      <section className="scenario-metrics" aria-label="Scenario metrics">{scenario.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></article>)}</section>

      <section className="scenario-method">
        <div><span>CALCULATION</span><strong>{scenario.calculation}</strong></div>
        <div><span>EVIDENCE BOUNDARY</span><p>{scenario.caveat}</p></div>
      </section>

      <section className="scenario-content-grid">
        <div className="scenario-card"><div className="scenario-card-heading"><span>01</span><h2>What the evidence means</h2></div><div className="scenario-insight-list">{scenario.insights.map((insight, index) => <article key={insight.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{insight.title}</h3><p>{insight.body}</p></div></article>)}</div></div>
        <div className="scenario-card evidence-card"><div className="scenario-card-heading"><span>02</span><h2>Jira evidence</h2></div><div className="evidence-list">{scenario.evidence.map((item) => <a key={item.key} href={item.href} target="_blank" rel="noreferrer"><div><strong>{item.key}</strong><span>{item.value}</span></div><small>{item.detail}</small><ArrowIcon /></a>)}</div></div>
      </section>

      <section className="scenario-action"><div><span className="scenario-eyebrow">TURNING INSIGHT INTO ACTION</span><h2>{scenario.actionTitle}</h2></div><div><p>{scenario.actionBody}</p><ol className="scenario-action-list">{scenario.actions.map((action) => <li key={action}>{action}</li>)}</ol></div></section>
      {!onClose && <footer className="scenario-footer">Source: DASH Jira board and supplied POC assumptions. Financial estimates are directional unless explicitly identified as actual cost.</footer>}
    </main>
  );
}

export function ScenarioModal({ kind, onClose }: { kind: ScenarioKind; onClose: () => void }) {
  return <div className="scenario-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="scenario-modal-frame" role="dialog" aria-modal="true" aria-label="Metric insight details"><ScenarioPage kind={kind} onClose={onClose} /></div></div>;
}
