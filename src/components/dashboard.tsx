"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  AgentInsight,
  EpicEvidence,
  FlowVelocityResponse,
  IssueComparison,
  SprintVelocity,
} from "@/lib/types";

function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : String(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : ""}${value}%`;
}

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortSprintName(name: string): string {
  const sprintNumber = name.match(/sprint\s*(\d+)/i)?.[1];
  return sprintNumber ? `S${sprintNumber}` : name;
}

function VelocityChart({ sprints }: { sprints: SprintVelocity[] }) {
  const chart = useMemo(() => {
    if (!sprints.length) return null;
    const width = 760;
    const height = 250;
    const padding = { left: 42, right: 24, top: 24, bottom: 44 };
    const maxValue = Math.max(
      10,
      ...sprints.map((sprint) => sprint.completedStoryPoints),
    );
    const xStep =
      sprints.length === 1
        ? 0
        : (width - padding.left - padding.right) / (sprints.length - 1);
    const plotHeight = height - padding.top - padding.bottom;
    const points = sprints.map((sprint, index) => ({
      sprint,
      x:
        sprints.length === 1
          ? width / 2
          : padding.left + index * xStep,
      y:
        padding.top +
        plotHeight * (1 - sprint.completedStoryPoints / maxValue),
    }));
    return {
      width,
      height,
      maxValue,
      padding,
      points,
      line: points.map(({ x, y }) => `${x},${y}`).join(" "),
    };
  }, [sprints]);

  if (!chart) {
    return <div className="empty-state">No closed sprint history is available.</div>;
  }

  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="chart-wrap">
      <svg
        className="velocity-chart"
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        role="img"
        aria-label="Completed story points by sprint"
      >
        {gridValues.map((ratio) => {
          const y =
            chart.padding.top +
            (chart.height - chart.padding.top - chart.padding.bottom) *
              (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={chart.padding.left}
                y1={y}
                x2={chart.width - chart.padding.right}
                y2={y}
                className="chart-grid"
              />
              <text x="4" y={y + 4} className="axis-label">
                {Math.round(chart.maxValue * ratio)}
              </text>
            </g>
          );
        })}
        <polyline points={chart.line} className="chart-line-shadow" />
        <polyline points={chart.line} className="chart-line" />
        {chart.points.map(({ sprint, x, y }) => {
          const highlighted = /sprint\s*(1|7)$/i.test(sprint.name.trim());
          return (
            <g key={sprint.id}>
              <circle
                cx={x}
                cy={y}
                r={highlighted ? 7 : 5}
                className={highlighted ? "chart-point highlight" : "chart-point"}
              >
                <title>{`${sprint.name}: ${sprint.completedStoryPoints} completed points`}</title>
              </circle>
              <text x={x} y={chart.height - 15} className="sprint-label">
                {shortSprintName(sprint.name)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function InsightCard({ insight, index }: { insight: AgentInsight; index: number }) {
  return (
    <article className={`insight-card ${insight.tone}`}>
      <div className="insight-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="insight-copy">
        <div className="insight-meta">
          <span>{insight.tone}</span>
          <span className={`confidence ${insight.confidence}`}>
            {insight.confidence} confidence
          </span>
        </div>
        <h3>{insight.title}</h3>
        <p className="finding">{insight.finding}</p>
        <p className="significance">{insight.significance}</p>
        <ul className="evidence-list">
          {insight.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {insight.caveat ? <p className="caveat">{insight.caveat}</p> : null}
      </div>
    </article>
  );
}

function EpicRow({ epic }: { epic: EpicEvidence }) {
  const progress = epic.childCount
    ? Math.round((epic.completedChildCount / epic.childCount) * 100)
    : 0;
  return (
    <tr>
      <td>
        <a href={epic.url} target="_blank" rel="noreferrer" className="issue-key">
          {epic.key}
        </a>
      </td>
      <td>
        <span className="epic-summary">{epic.summary}</span>
        <div className="progress-track" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </td>
      <td>
        <span className={`status-pill ${epic.statusCategory.toLowerCase()}`}>
          {epic.status}
        </span>
      </td>
      <td>{epic.childCount ? `${epic.completedChildCount}/${epic.childCount}` : "—"}</td>
      <td>
        {epic.childStoryPoints
          ? `${epic.completedChildStoryPoints}/${epic.childStoryPoints}`
          : "—"}
      </td>
      <td>{epic.aiAssistedChildCount || "—"}</td>
      <td>
        {epic.openCriticalChildren.length ? (
          <span className="critical-count">{epic.openCriticalChildren.length}</span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

function ComparisonCard({ comparison }: { comparison: IssueComparison }) {
  return (
    <article className="comparison-card">
      <div>
        <span className="eyebrow">Baseline</span>
        <a
          href={comparison.baseline?.url}
          target="_blank"
          rel="noreferrer"
          className="comparison-key"
        >
          {comparison.baseline?.key ?? "Unavailable"}
        </a>
        <p>{comparison.baseline?.summary ?? "Issue evidence was not available."}</p>
        <div className="mini-stats">
          <span>{formatNumber(comparison.baseline?.storyPoints)} pts</span>
          <span>{formatNumber(comparison.baseline?.cycleTimeDays)} days</span>
        </div>
      </div>
      <div className="comparison-arrow" aria-hidden="true">→</div>
      <div>
        <span className="eyebrow">AI-assisted</span>
        <a
          href={comparison.assisted?.url}
          target="_blank"
          rel="noreferrer"
          className="comparison-key"
        >
          {comparison.assisted?.key ?? "Unavailable"}
        </a>
        <p>{comparison.assisted?.summary ?? "Issue evidence was not available."}</p>
        <div className="mini-stats">
          <span>{formatNumber(comparison.assisted?.storyPoints)} pts</span>
          <span>{formatNumber(comparison.assisted?.cycleTimeDays)} days</span>
        </div>
      </div>
      <div className="comparison-result">
        <span>Cycle-time change</span>
        <strong>{formatPercent(comparison.cycleTimeChangePercent)}</strong>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <main className="shell loading-shell">
      <div className="loading-mark"><span /></div>
      <p className="eyebrow">Reading live Jira evidence</p>
      <h1>Building delivery insights…</h1>
      <p>Sprint reports, Epic relationships, and AI Tool usage are being normalized.</p>
    </main>
  );
}

export function Dashboard() {
  const [data, setData] = useState<FlowVelocityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/insights/flow-velocity", {
        cache: "no-store",
      });
      const payload = (await response.json()) as
        | FlowVelocityResponse
        | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Insight request failed.");
      }
      setData(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load delivery insights.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading && !data) return <LoadingState />;

  if (error && !data) {
    return (
      <main className="shell error-shell">
        <p className="eyebrow">Connection problem</p>
        <h1>Jira evidence could not be loaded.</h1>
        <p>{error}</p>
        <button type="button" className="primary-button" onClick={() => void refresh()}>
          Try again
        </button>
      </main>
    );
  }

  if (!data) return null;

  const { evidence, narrative } = data;
  const upliftPositive = (evidence.change?.points ?? 0) >= 0;

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href={evidence.board.url} target="_blank" rel="noreferrer">
          <span className="brand-mark">D</span>
          <span>
            <strong>Delivery Intelligence</strong>
            <small>{evidence.board.name}</small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="live-indicator"><i /> Live Jira</span>
          <button
            type="button"
            className="refresh-button"
            onClick={() => void refresh()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh evidence"}
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Agent&apos;s Insights · Flow Velocity</p>
          <h1>{narrative.headline}</h1>
          <p className="hero-summary">{narrative.summary}</p>
        </div>
        <div className="source-card">
          <span className="source-label">Narrative source</span>
          <strong>{narrative.source === "openai" ? "OpenAI grounded analysis" : "Deterministic analysis"}</strong>
          <span>{narrative.model ?? "OpenAI narrative unavailable"}</span>
          {narrative.fallbackReason ? <small className="source-error">{narrative.fallbackReason}</small> : null}
          <small>Updated {formatTimestamp(evidence.generatedAt)}</small>
        </div>
      </section>

      <section className="metric-grid" aria-label="Velocity summary">
        <article className="metric-card">
          <span>Baseline</span>
          <strong>{formatNumber(evidence.baseline?.completedStoryPoints)}</strong>
          <small>{evidence.baseline?.name ?? "Sprint 1 unavailable"} · completed points</small>
        </article>
        <article className="metric-card featured">
          <span>Comparison</span>
          <strong>{formatNumber(evidence.comparison?.completedStoryPoints)}</strong>
          <small>{evidence.comparison?.name ?? "Sprint 7 unavailable"} · completed points</small>
        </article>
        <article className={`metric-card ${upliftPositive ? "positive" : "negative"}`}>
          <span>Velocity change</span>
          <strong>{formatPercent(evidence.change?.percentage)}</strong>
          <small>{formatNumber(evidence.change?.points)} point difference</small>
        </article>
        <article className="metric-card">
          <span>AI-assisted scope</span>
          <strong>{evidence.aiAssistedStoryPoints}</strong>
          <small>{evidence.aiAssistedIssues.length} completed issue(s) · known points</small>
        </article>
      </section>

      {evidence.warnings.length ? (
        <section className="warning-panel" aria-label="Data warnings">
          <strong>Evidence notes</strong>
          <ul>
            {evidence.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </section>
      ) : null}

      <section className="content-grid">
        <div className="panel chart-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Delivery history</p>
              <h2>Completed story points</h2>
            </div>
            <span className="section-note">Closed sprints · Jira Sprint Report</span>
          </div>
          <VelocityChart sprints={evidence.sprintHistory} />
        </div>

        <div className="panel validation-panel">
          <p className="eyebrow">Scenario validation</p>
          <h2>
            {evidence.scenarioValidation?.matchesExpected
              ? "PoC target confirmed"
              : "Live values need review"}
          </h2>
          <p>
            Expected: 40 points in Sprint 1 and 56 points in Sprint 7, producing a 40% uplift.
          </p>
          <div className={evidence.scenarioValidation?.matchesExpected ? "validation yes" : "validation no"}>
            <span />
            {evidence.scenarioValidation?.matchesExpected ? "Matched" : "Not matched"}
          </div>
        </div>
      </section>

      <section className="insights-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Decision signals</p>
            <h2>What the evidence says</h2>
          </div>
          <span className="section-note">Grounded in {evidence.project.issueCount} current Jira issues</span>
        </div>
        <div className="insight-list">
          {narrative.insights.map((item, index) => (
            <InsightCard key={item.id} insight={item} index={index} />
          ))}
        </div>
      </section>

      <section className="panel epic-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Portfolio evidence</p>
            <h2>Current Epic health</h2>
          </div>
          <span className="section-note">Live hierarchy rollup</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Epic</th>
                <th>Outcome</th>
                <th>Status</th>
                <th>Stories done</th>
                <th>Points done</th>
                <th>AI-assisted</th>
                <th>Critical open</th>
              </tr>
            </thead>
            <tbody>
              {evidence.epics.map((epic) => <EpicRow key={epic.key} epic={epic} />)}
            </tbody>
          </table>
          {!evidence.epics.length ? <div className="empty-state">No Epic issues were found.</div> : null}
        </div>
      </section>

      <section className="comparison-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Like-for-like evidence</p>
            <h2>Comparable story analysis</h2>
          </div>
          <span className="section-note">Points · active cycle time</span>
        </div>
        <div className="comparison-grid">
          {evidence.comparablePairs.map((comparison) => (
            <ComparisonCard key={comparison.label} comparison={comparison} />
          ))}
        </div>
      </section>

      <footer>
        <span>Read-only analysis · No Jira data is modified</span>
        <a href={evidence.project.url} target="_blank" rel="noreferrer">Open DASH in Jira ↗</a>
      </footer>
    </main>
  );
}
