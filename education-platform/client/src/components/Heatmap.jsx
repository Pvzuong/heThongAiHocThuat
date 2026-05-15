import { useEffect, useState } from 'react';
import { getHeatmap } from '../api/lessonApi';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS  = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

function buildGrid(activities, year) {
  const map = {};
  activities.forEach(({ date, count, value }) => {
    map[date.slice(0, 10)] = parseInt(count ?? value ?? 0);
  });

  const jan1 = new Date(year, 0, 1);
  const startOffset = (jan1.getDay() + 6) % 7;
  const start = new Date(jan1);
  start.setDate(start.getDate() - startOffset);

  const weeks = [];
  let d = new Date(start);
  while (d.getFullYear() <= year) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().slice(0, 10);
      week.push({ date: key, count: map[key] || 0, inYear: d.getFullYear() === year });
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
    if (d.getFullYear() > year && d.getMonth() > 0) break;
  }
  return weeks;
}

function buildMonthLabels(weeks) {
  const labels = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const first = week.find(c => c.inYear);
    if (!first) return;
    const m = first.date.slice(5, 7);
    if (m !== lastMonth) { labels.push({ weekIdx: wi, month: parseInt(m, 10) - 1 }); lastMonth = m; }
  });
  return labels;
}

function heatColor(count) {
  if (count === 0) return 'var(--heat-0)';
  if (count <= 2)  return 'var(--heat-1)';
  if (count <= 5)  return 'var(--heat-2)';
  if (count <= 10) return 'var(--heat-3)';
  return 'var(--heat-4)';
}

const CELL = 12, GAP = 2;

const Heatmap = ({ data: externalData }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear]           = useState(currentYear);
  const [activities, setActivities] = useState([]);
  const [total, setTotal]         = useState(0);

  useEffect(() => {
    if (externalData) {
      setActivities(externalData);
      setTotal(externalData.reduce((s, r) => s + parseInt(r.count ?? r.value ?? 0), 0));
      return;
    }
    getHeatmap(year)
      .then(res => {
        setActivities(res.data);
        setTotal(res.data.reduce((s, r) => s + parseInt(r.count ?? r.value ?? 0), 0));
      })
      .catch(() => setActivities([]));
  }, [year, externalData]);

  const weeks       = buildGrid(activities, year);
  const monthLabels = buildMonthLabels(weeks);
  const years       = [currentYear, currentYear - 1];
  const DAY_LABEL_W = 28;

  return (
    <div className="heatmap-card">
      <div className="heatmap-header">
        <div>
          <span className="heatmap-title">Activity Map</span>
          <span className="heatmap-subtitle"> · {total} hoạt động</span>
        </div>
        <div className="heatmap-year-btns">
          {years.map(y => (
            <button
              key={y}
              className={`heatmap-year-btn${year === y ? ' active' : ''}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="heatmap-grid-wrap">
        {/* Day labels column */}
        <div className="heatmap-day-labels" style={{ width: DAY_LABEL_W }}>
          {/* month label row spacer */}
          <span className="heatmap-day-label" style={{ height: 18 }} />
          {[0,1,2,3,4,5,6].map(d => (
            <span key={d} className="heatmap-day-label">{DAY_LABELS[d] || ''}</span>
          ))}
        </div>

        {/* Weeks + month labels */}
        <div style={{ flex: 1, overflowX: 'auto' }}>
          {/* Month labels row */}
          <div className="heatmap-months-row">
            {monthLabels.map(({ weekIdx, month }) => (
              <span
                key={month}
                className="heatmap-month-label"
                style={{ left: weekIdx * (CELL + GAP) }}
              >
                {MONTH_NAMES[month]}
              </span>
            ))}
          </div>

          {/* Cells */}
          <div className="heatmap-weeks">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-week">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className="heatmap-cell"
                    style={{ background: cell.inYear ? heatColor(cell.count) : 'transparent' }}
                    title={cell.inYear ? `${cell.date}: ${cell.count} hoạt động` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Ít hơn</span>
        {[0,1,2,3,4].map(i => (
          <div key={i} className="heatmap-cell" style={{ background: heatColor(i === 0 ? 0 : i * 3) }} />
        ))}
        <span>Nhiều hơn</span>
      </div>
    </div>
  );
};

export default Heatmap;
