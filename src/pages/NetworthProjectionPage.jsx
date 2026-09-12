import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Target,
  DollarSign,
  Percent,
  Calendar,
  Home,
  Car,
  Heart,
  Clock,
  ArrowRight,
  Loader2,
  User,
  Maximize2,
  Minimize2,
  Flag,
} from 'lucide-react';

const MAX_YEARS = 40;
const MILESTONE_STEP = 5;

const EVENT_DEFS = [
  { id: 'home', label: 'Home Purchase', icon: Home, color: '#f97316', defaultCost: 104580, defaultYear: 5 },
  { id: 'car', label: 'Car Purchase', icon: Car, color: '#22d3ee', defaultCost: 40000, defaultYear: 3 },
  { id: 'marriage', label: 'Marriage', icon: Heart, color: '#ec4899', defaultCost: 30000, defaultYear: 2 },
];

const EVENTS_LINE_COLOR = '#a855f7';
const STANDARD_LINE_COLOR = '#3b82f6';
const GOAL_LINE_COLOR = '#f59e0b';
const MULTI_EVENT_COLOR = '#94a3b8';

// ---- Formatting / parsing helpers ---------------------------------------

const formatFullCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatCompactCurrency = (value) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

// Formats a raw number as a comma-grouped string for display in text inputs
const formatWithCommas = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString('en-US') : '';
};

// Strips anything that isn't a digit, minus sign, or decimal point, then
// clamps to [min, max]. Protects against pasted garbage ("1e10", "$1,2x3").
const sanitizeNumeric = (raw, { min = -Infinity, max = Infinity, fallback = 0 } = {}) => {
  const cleaned = String(raw).replace(/[^0-9.-]/g, '');
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
};

// ---- Custom X-axis tick: year on top, projected age underneath -----------

const AgeYearTick = ({ x, y, payload, currentAge }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={12} textAnchor="middle" fill="#94a3b8" fontSize={12}>
      {payload.value}
    </text>
    <text x={0} y={0} dy={26} textAnchor="middle" fill="#64748b" fontSize={10}>
      Age {currentAge + payload.value}
    </text>
  </g>
);

// ---- Custom tooltip -------------------------------------------------------

const ProjectionTooltip = ({ active, payload, label, eventsByYear }) => {
  if (!active || !payload || payload.length === 0) return null;

  const yearEvents = eventsByYear[label] || [];
  const age = payload[0]?.payload?.age;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 shadow-2xl min-w-[220px]">
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-700">
        <div>
          <p className="text-slate-200 font-semibold">Year {label}</p>
          {age !== undefined && <p className="text-slate-500 text-xs">Age {age}</p>}
        </div>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {yearEvents.map((ev) => (
            <span
              key={ev.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
              style={{ color: ev.color, borderColor: `${ev.color}55`, backgroundColor: `${ev.color}1a` }}
            >
              {ev.label}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="text-white font-bold">{formatFullCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Reusable fields -------------------------------------------------------

// Plain numeric field (used for small integer values like years / rate)
const NumberField = ({ id, label, icon: Icon, value, onChange, min, max, step }) => (
  <div>
    <label htmlFor={id} className="block text-sm text-slate-300 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
      />
    </div>
  </div>
);

// Currency field: text input so it can show thousands separators, with
// sanitized parsing on change and a clamp on blur.
const CurrencyField = ({ id, label, icon: Icon, value, onValueChange, min = 0, max = Infinity, compact = false }) => {
  const [text, setText] = useState(formatWithCommas(value));

  useEffect(() => {
    setText(formatWithCommas(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setText(raw);
    if (raw.trim() === '') return;
    const numeric = sanitizeNumeric(raw, { min, max, fallback: null });
    if (numeric !== null) onValueChange(numeric);
  };

  const handleBlur = () => {
    const numeric = sanitizeNumeric(text, { min, max, fallback: min });
    onValueChange(numeric);
    setText(formatWithCommas(numeric));
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className={`block text-slate-300 mb-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute ${compact ? 'left-2 w-3.5 h-3.5' : 'left-3 w-4 h-4'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`}
          />
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full ${Icon ? (compact ? 'pl-6' : 'pl-9') : 'pl-3'} pr-3 ${
            compact ? 'py-2 text-sm' : 'py-2.5'
          } bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors`}
        />
      </div>
    </div>
  );
};

// ---- Stat card --------------------------------------------------------------

const StatCard = ({ label, value, sub, icon: Icon, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border border-white/10 shadow-lg`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-white/70 text-xs font-medium uppercase tracking-wide">{label}</span>
      {Icon && <Icon className="w-4 h-4 text-white/70" />}
    </div>
    <p className="text-2xl font-bold text-white leading-tight">{value}</p>
    {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
  </div>
);

// ---- Loading skeleton ---------------------------------------------------------

const ProjectionLoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
      <p className="text-slate-300 font-medium">Loading your portfolio data…</p>
      <p className="text-slate-500 text-sm mt-1">Syncing net worth from the dashboard</p>
    </div>
  </div>
);

// ---- Main component -----------------------------------------------------------

const NetworthProjectionPage = ({ netWorth = 100000, isLoading = false }) => {
  const [initialBalance, setInitialBalance] = useState(() => (netWorth > 0 ? netWorth : 100000));
  const [balanceManuallySet, setBalanceManuallySet] = useState(false);
  const [annualContribution, setAnnualContribution] = useState(25000);
  const [targetGoal, setTargetGoal] = useState(1000000);
  const [returnRate, setReturnRate] = useState(10);
  const [currentAge, setCurrentAge] = useState(30);
  const [showAllYears, setShowAllYears] = useState(true);

  const [events, setEvents] = useState(
    EVENT_DEFS.map((ev) => ({ ...ev, enabled: false, cost: ev.defaultCost, year: ev.defaultYear }))
  );

  // Keep the starting balance in sync with the dashboard net worth until the
  // person edits the field themselves. Ignored while net worth is still 0
  // (i.e. still loading) so the field never flashes to $0.
  useEffect(() => {
    if (!balanceManuallySet && netWorth > 0) {
      setInitialBalance(netWorth);
    }
  }, [netWorth, balanceManuallySet]);

  const isSyncedToNetWorth = netWorth > 0 && Math.round(initialBalance) === Math.round(netWorth);

  const updateEvent = (id, patch) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)));
  };

  const activeEvents = useMemo(() => events.filter((ev) => ev.enabled), [events]);
  const hasActiveEvents = activeEvents.length > 0;
  const latestEventYear = useMemo(
    () => (activeEvents.length > 0 ? Math.max(...activeEvents.map((ev) => ev.year)) : 0),
    [activeEvents]
  );

  // ---- Core projection engine ----
  const projectionData = useMemo(() => {
    const data = [];
    const rate = returnRate / 100;
    const cap = targetGoal > 0 ? targetGoal * 1.5 : Infinity;

    let standardBalance = initialBalance;
    let eventsBalance = initialBalance;

    const applyEventsForYear = (year) => {
      activeEvents.forEach((ev) => {
        if (ev.year === year) eventsBalance -= ev.cost;
      });
    };

    applyEventsForYear(0);
    data.push({
      year: 0,
      age: currentAge,
      standard: Math.round(standardBalance),
      withEvents: Math.round(eventsBalance),
    });

    for (let year = 1; year <= MAX_YEARS; year++) {
      standardBalance = standardBalance * (1 + rate) + annualContribution;
      eventsBalance = eventsBalance * (1 + rate) + annualContribution;
      applyEventsForYear(year);

      data.push({
        year,
        age: currentAge + year,
        standard: Math.round(standardBalance),
        withEvents: Math.round(eventsBalance),
      });

      // Truncate early once both paths comfortably clear 150% of the goal —
      // but never before every enabled life event has actually occurred.
      const allEventsApplied = year >= latestEventYear;
      if (allEventsApplied && standardBalance >= cap && eventsBalance >= cap) break;
    }

    return data;
  }, [initialBalance, annualContribution, targetGoal, returnRate, activeEvents, latestEventYear, currentAge]);

  const lastPoint = projectionData[projectionData.length - 1];

  const yearsToGoal = useMemo(() => {
    const hit = projectionData.find((d) => d.standard >= targetGoal);
    return hit ? hit.year : null;
  }, [projectionData, targetGoal]);

  const eventsImpact = hasActiveEvents && lastPoint ? lastPoint.standard - lastPoint.withEvents : 0;

  // Map of year -> events landing on it, used by the tooltip and the table
  const eventsByYear = useMemo(() => {
    const map = {};
    activeEvents.forEach((ev) => {
      if (!map[ev.year]) map[ev.year] = [];
      map[ev.year].push(ev);
    });
    return map;
  }, [activeEvents]);

  // Grouped by year for chart reference lines, so two events landing on the
  // same year render one combined label instead of two stacked ones.
  const eventYearGroups = useMemo(
    () =>
      Object.entries(eventsByYear)
        .map(([year, evs]) => ({
          year: Number(year),
          label: evs.map((e) => e.label).join(' + '),
          color: evs.length === 1 ? evs[0].color : MULTI_EVENT_COLOR,
        }))
        .sort((a, b) => a.year - b.year),
    [eventsByYear]
  );

  // ---- Milestone rows: every 5 years, plus any active event year and the final year ----
  const milestones = useMemo(() => {
    const years = new Set();
    projectionData.forEach((d) => {
      if (d.year % MILESTONE_STEP === 0) years.add(d.year);
    });
    activeEvents.forEach((ev) => {
      if (projectionData.some((d) => d.year === ev.year)) years.add(ev.year);
    });
    if (lastPoint) years.add(lastPoint.year);

    return projectionData.filter((d) => years.has(d.year)).sort((a, b) => a.year - b.year);
  }, [projectionData, activeEvents, lastPoint]);

  if (isLoading) {
    return <ProjectionLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Net Worth Projection
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Model how your portfolio compounds over time, with or without major life events
          </p>
        </div>

        {/* Inputs panel */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 sm:p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Projection Inputs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <NumberField
              id="current-age"
              label="Current Age"
              icon={User}
              value={currentAge}
              min={0}
              max={100}
              step={1}
              onChange={(e) =>
                setCurrentAge(sanitizeNumeric(e.target.value, { min: 0, max: 100, fallback: 0 }))
              }
            />

            {/* Initial balance, synced with dashboard net worth */}
            <div>
              <CurrencyField
                id="initial-balance"
                label="Initial Portfolio Balance"
                icon={DollarSign}
                value={initialBalance}
                min={0}
                onValueChange={(val) => {
                  setBalanceManuallySet(true);
                  setInitialBalance(val);
                }}
              />
              <div className="flex items-center justify-between gap-2 mt-1.5 min-h-[18px]">
                <p className="text-xs text-slate-500 truncate">
                  {isSyncedToNetWorth
                    ? 'Synced with dashboard net worth'
                    : netWorth > 0
                    ? `Dashboard net worth: ${formatCompactCurrency(netWorth)}`
                    : ' '}
                </p>
                {!isSyncedToNetWorth && netWorth > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInitialBalance(netWorth);
                      setBalanceManuallySet(false);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex-shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <CurrencyField
              id="annual-contribution"
              label="Annual Contribution"
              icon={DollarSign}
              value={annualContribution}
              min={0}
              onValueChange={setAnnualContribution}
            />
            <CurrencyField
              id="target-goal"
              label="Target Goal"
              icon={Target}
              value={targetGoal}
              min={1}
              onValueChange={setTargetGoal}
            />
            <NumberField
              id="return-rate"
              label="Expected Annual Return (%)"
              icon={Percent}
              value={returnRate}
              step={0.1}
              onChange={(e) => setReturnRate(sanitizeNumeric(e.target.value, { min: -100, max: 100, fallback: 0 }))}
            />
          </div>

          {/* Life events */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              Life Events
              <span className="text-xs font-normal text-slate-500">
                Toggle any that apply, each subtracts its cost in its chosen year
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {events.map((ev) => {
                const Icon = ev.icon;
                return (
                  <div
                    key={ev.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      ev.enabled ? 'border-slate-500/60 bg-slate-700/40' : 'border-slate-700/50 bg-slate-900/30'
                    }`}
                  >
                    <label className="flex items-center justify-between cursor-pointer select-none mb-1">
                      <span className="flex items-center gap-2 text-white font-medium text-sm">
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: ev.color }} />
                        {ev.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={ev.enabled}
                        onChange={(e) => updateEvent(ev.id, { enabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 cursor-pointer flex-shrink-0"
                      />
                    </label>

                    {ev.enabled && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <CurrencyField
                          id={`${ev.id}-cost`}
                          label="Cost"
                          icon={DollarSign}
                          compact
                          value={ev.cost}
                          min={0}
                          onValueChange={(val) => updateEvent(ev.id, { cost: val })}
                        />
                        <NumberField
                          id={`${ev.id}-year`}
                          label="Year"
                          icon={Calendar}
                          value={ev.year}
                          min={0}
                          max={MAX_YEARS}
                          step={1}
                          onChange={(e) =>
                            updateEvent(ev.id, {
                              year: sanitizeNumeric(e.target.value, { min: 0, max: MAX_YEARS, fallback: 0 }),
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Starting Point"
            value={formatCompactCurrency(initialBalance)}
            sub={`+${formatCompactCurrency(annualContribution)} / year`}
            icon={DollarSign}
            gradient="from-blue-600 to-blue-700"
          />
          <StatCard
            label="Target Goal"
            value={formatCompactCurrency(targetGoal)}
            sub={`${returnRate}% expected return`}
            icon={Target}
            gradient="from-purple-600 to-purple-700"
          />
          <StatCard
            label="Years to Goal"
            value={yearsToGoal !== null ? `${yearsToGoal} yrs` : `${MAX_YEARS}+ yrs`}
            sub={yearsToGoal !== null ? `Age ${currentAge + yearsToGoal} • standard path` : 'Standard path'}
            icon={Clock}
            gradient="from-emerald-600 to-emerald-700"
          />
          <StatCard
            label={hasActiveEvents ? 'Life Events Impact' : 'Life Events'}
            value={hasActiveEvents ? formatCompactCurrency(eventsImpact) : 'Not modeled'}
            sub={
              hasActiveEvents
                ? `Lower balance across ${activeEvents.length} event${activeEvents.length > 1 ? 's' : ''}`
                : 'Toggle an event above to compare'
            }
            icon={Home}
            gradient="from-orange-600 to-orange-700"
          />
        </div>

        {/* Chart */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 sm:p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Projected Growth
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={projectionData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                height={44}
                tick={<AgeYearTick currentAge={currentAge} />}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCompactCurrency}
                width={70}
              />
              <Tooltip content={<ProjectionTooltip eventsByYear={eventsByYear} />} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />

              <ReferenceLine
                y={targetGoal}
                stroke={GOAL_LINE_COLOR}
                strokeDasharray="4 4"
                label={{ value: 'Goal', fill: GOAL_LINE_COLOR, fontSize: 11, position: 'right' }}
              />
              {eventYearGroups.map((group) => (
                <ReferenceLine
                  key={group.year}
                  x={group.year}
                  stroke={group.color}
                  strokeDasharray="4 4"
                  label={{ value: group.label, fill: group.color, fontSize: 11, position: 'top' }}
                />
              ))}

              {/* Solid line vs. dashed line so the two paths read without relying on color alone */}
              <Line
                type="monotone"
                dataKey="standard"
                name="Standard Path"
                stroke={STANDARD_LINE_COLOR}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              {hasActiveEvents && (
                <Line
                  type="monotone"
                  dataKey="withEvents"
                  name="With Life Events"
                  stroke={EVENTS_LINE_COLOR}
                  strokeWidth={2.5}
                  strokeDasharray="7 4"
                  dot={false}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-slate-500 mt-2">
            X-axis shows the projection year, with your projected age underneath.
          </p>
        </div>

        {/* Milestone table */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6 border-b border-slate-700/50 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Milestone Summary
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {showAllYears
                  ? `Every year, 0 through ${lastPoint ? lastPoint.year : MAX_YEARS}`
                  : `Every ${MILESTONE_STEP} years, plus event years`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllYears((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-sm font-medium text-slate-200 transition-colors flex-shrink-0"
            >
              {showAllYears ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  Compact View
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  Show All Years
                </>
              )}
            </button>
          </div>

          <div className={`overflow-x-auto ${showAllYears ? 'max-h-[520px] overflow-y-auto' : ''}`}>
            <table className="w-full">
              <thead className="bg-slate-900/50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-300">
                    Year
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-slate-300">
                    Age
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-slate-300">
                    Standard Path
                  </th>
                  {hasActiveEvents && (
                    <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-slate-300">
                      With Life Events
                    </th>
                  )}
                  <th scope="col" className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-semibold text-slate-300">
                    Events
                  </th>
                </tr>
              </thead>
              <tbody>
                {(showAllYears ? projectionData : milestones).map((row) => {
                  const rowEvents = eventsByYear[row.year] || [];
                  const isEventYear = rowEvents.length > 0;
                  const goalReached = row.standard >= targetGoal;
                  const isCurrentYear = row.year === 0;

                  return (
                    <tr
                      key={row.year}
                      className={`border-t border-slate-700/40 transition-colors ${
                        isEventYear ? 'bg-orange-500/10 hover:bg-orange-500/20' : 'hover:bg-slate-700/20'
                      }`}
                    >
                      <td className="px-4 sm:px-6 py-4 text-white font-medium whitespace-nowrap">
                        Year {row.year}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-slate-400 whitespace-nowrap">{row.age}</td>
                      <td className="px-4 sm:px-6 py-4 text-right text-blue-300 font-semibold whitespace-nowrap">
                        {formatFullCurrency(row.standard)}
                      </td>
                      {hasActiveEvents && (
                        <td className="px-4 sm:px-6 py-4 text-right text-purple-300 font-semibold whitespace-nowrap">
                          {formatFullCurrency(row.withEvents)}
                        </td>
                      )}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {isCurrentYear && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 whitespace-nowrap">
                              <Flag className="w-3 h-3" />
                              Current
                            </span>
                          )}
                          {rowEvents.map((ev) => {
                            const Icon = ev.icon;
                            return (
                              <span
                                key={ev.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap"
                                style={{ color: ev.color, borderColor: `${ev.color}55`, backgroundColor: `${ev.color}1a` }}
                              >
                                <Icon className="w-3 h-3" />
                                {ev.label}
                              </span>
                            );
                          })}
                          {goalReached && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 whitespace-nowrap">
                              <Target className="w-3 h-3" />
                              Goal Reached
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {lastPoint && lastPoint.year < MAX_YEARS && (
            <div className="px-5 sm:px-6 py-3 border-t border-slate-700/50 bg-slate-900/30 flex items-center gap-2 text-xs text-slate-400">
              <ArrowRight className="w-3.5 h-3.5" />
              Projection stopped early at year {lastPoint.year} — every enabled life event had occurred
              and both paths comfortably cleared 150% of the target goal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworthProjectionPage;
