import Link from "next/link";

type Scenario = {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: "orange" | "purple";
  conclusion: string;
  jiraBoard: string;
  metrics: Array<{ label: string; value: string; note: string }>;
  insights: Array<{ title: string; body: string }>;
  evidence: Array<{ key: string; value: string; detail: string; href: string }>;
  actionTitle: string;
  actionBody: string;
};

const scenarios: Record<string, Scenario> = {
  unplanned: {
    eyebrow: "SCENARIO INSIGHT · FLOW GOVERNANCE",
    title: "Managing Unplanned Work",
    subtitle: "How release decisions protected the highest-value scope during the final phase.",
    accent: "orange",
    conclusion: "Product Management kept late, low-value scope from displacing a higher-value capability already aligned to the final phase.",
    jiraBoard: "https://proactionnppoc.ent.cgi.com/jira/secure/RapidBoard.jspa?rapidView=4174&projectKey=DASH&view=planning.nodetail&epics=visible&issueLimit=100",
    metrics: [
      { label: "Value protected", value: "$500K", note: "DASH-20 business value" },
      { label: "Late-scope value", value: "$10K", note: "DASH-21 business value" },
      { label: "Value ratio", value: "50×", note: "DASH-20 versus DASH-21" },
    ],
    insights: [
      { title: "Timing made the decision clearer", body: "DASH-20 was defined on October 1 for the assumed start of the final phase. DASH-21 appeared on November 2, after the release had less room to absorb new scope without creating churn." },
      { title: "Value outweighed urgency", body: "DASH-20 carried $500,000 of business value and Critical priority. DASH-21 carried only $10,000, so accepting it late would have traded focus away from a capability with roughly 50 times the modeled value." },
      { title: "Removing scope is a delivery action", body: "Downgrading DASH-21 to Medium and removing it from FixVersion 1.2.0 converts an uncomfortable late request into an explicit portfolio decision. The team can finish committed work without hiding the trade-off." },
    ],
    evidence: [
      { key: "DASH-20", value: "Critical · $500K", detail: "October 1 date; appropriate for the final phase", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-20" },
      { key: "DASH-21", value: "Medium · $10K", detail: "November 2 date; removed from FixVersion 1.2.0", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-21" },
    ],
    actionTitle: "Recommended operating rule",
    actionBody: "Require every late-scope request to show its business value, target date, and the committed item it would displace. Keep the request visible, but do not let it enter the release without an explicit product decision.",
  },
  defects: {
    eyebrow: "SCENARIO INSIGHT · QUALITY ECONOMICS",
    title: "Defect Cost Avoidance",
    subtitle: "How customer impact and corrective action turn defect data into a financial insight.",
    accent: "purple",
    conclusion: "The team can justify immediate remediation when a Critical production defect affects hundreds of customers; a false positive should not consume the same capacity.",
    jiraBoard: "https://proactionnppoc.ent.cgi.com/jira/secure/RapidBoard.jspa?rapidView=4174&projectKey=DASH&view=planning.nodetail&epics=visible&issueLimit=100",
    metrics: [
      { label: "Customers affected", value: "800", note: "DASH-18 production impact" },
      { label: "Modeled value per customer", value: "$5K", note: "DASH-15 business value" },
      { label: "Value protected", value: "$4M", note: "800 × $5,000" },
    ],
    insights: [
      { title: "Impact creates the priority signal", body: "DASH-18 is Critical and affected 800 customers during the 1.1.2 production deployment. That combination makes it more than a defect count—it is a material customer and value exposure." },
      { title: "The corrective story has a measurable payoff", body: "DASH-17 is the corrective action story for DASH-18. Using the $5,000 business-value assumption on DASH-15, completing the remediation protects an implied $4M of customer value." },
      { title: "Triage prevents wasted remediation", body: "DASH-19 is a false positive and carries no business impact. Separating it from DASH-18 prevents the team from spending scarce corrective capacity on a defect that does not change customer outcomes." },
    ],
    evidence: [
      { key: "DASH-15", value: "Epic · $5,000", detail: "Parent value assumption; deployment context is 1.1.2", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-15" },
      { key: "DASH-17", value: "Corrective action", detail: "Story linked to the remediation of DASH-18", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-17" },
      { key: "DASH-18", value: "Critical · 800 customers", detail: "Production defect that drives the $4M modeled exposure", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-18" },
      { key: "DASH-19", value: "False positive", detail: "No business impact; no remediation value assigned", href: "https://proactionnppoc.ent.cgi.com/jira/browse/DASH-19" },
    ],
    actionTitle: "Recommended operating rule",
    actionBody: "Prioritize defects using customer exposure × business value × severity, then link the corrective story to the defect. This makes the cost of delay visible and keeps false positives from distorting quality priorities.",
  },
};

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export function ScenarioPage({ kind }: { kind: "unplanned" | "defects" }) {
  const scenario = scenarios[kind];

  return (
    <main className={`scenario-shell ${scenario.accent}`}>
      <nav className="scenario-nav">
        <Link href="/">← Executive dashboard</Link>
        <Link href="/insights">Live Jira insights</Link>
      </nav>

      <header className="scenario-hero">
        <div>
          <span className="scenario-eyebrow">{scenario.eyebrow}</span>
          <h1>{scenario.title}</h1>
          <p>{scenario.subtitle}</p>
        </div>
        <a className="board-link" href={scenario.jiraBoard} target="_blank" rel="noreferrer">Open Jira board <ArrowIcon /></a>
      </header>

      <section className="scenario-conclusion">
        <span className="conclusion-mark">✦</span>
        <div><strong>Agent insight</strong><p>{scenario.conclusion}</p></div>
      </section>

      <section className="scenario-metrics" aria-label="Scenario metrics">
        {scenario.metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></article>)}
      </section>

      <section className="scenario-content-grid">
        <div className="scenario-card">
          <div className="scenario-card-heading"><span>01</span><h2>What changed</h2></div>
          <div className="scenario-insight-list">{scenario.insights.map((insight, index) => <article key={insight.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{insight.title}</h3><p>{insight.body}</p></div></article>)}</div>
        </div>
        <div className="scenario-card evidence-card">
          <div className="scenario-card-heading"><span>02</span><h2>Jira evidence</h2></div>
          <div className="evidence-list">{scenario.evidence.map((item) => <a key={item.key} href={item.href} target="_blank" rel="noreferrer"><div><strong>{item.key}</strong><span>{item.value}</span></div><small>{item.detail}</small><ArrowIcon /></a>)}</div>
        </div>
      </section>

      <section className="scenario-action"><div><span className="scenario-eyebrow">TURNING INSIGHT INTO ACTION</span><h2>{scenario.actionTitle}</h2></div><p>{scenario.actionBody}</p></section>
      <footer className="scenario-footer">Source: DASH Jira board · Scenario values are directional and based on the supplied POC assumptions.</footer>
    </main>
  );
}
