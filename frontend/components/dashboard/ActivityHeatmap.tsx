"use client";
import React, { useEffect, useRef, useState } from 'react';

export interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  count: number;
  breakdown?: { submissions?: number; messages?: number; reviews?: number; milestones?: number };
}

interface Props {
  days: HeatmapDay[];
  year: number;
  label?: string;
}

const CELL = 13;   // cell size + gap
const DAY_LABEL_W = 24;
const MONTH_LABEL_H = 20;
const WEEKS = 53;
const DAYS = 7;

const COLOR_SCALE = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

function countToLevel(n: number): number {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 9) return 3;
  return 4;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function buildGrid(year: number, days: HeatmapDay[]) {
  const map = new Map<string, HeatmapDay>();
  for (const d of days) map.set(d.date, d);

  // Jan 1 of the year
  const jan1 = new Date(year, 0, 1);
  // Start from the Sunday on or before Jan 1
  const startDay = new Date(jan1);
  startDay.setDate(jan1.getDate() - jan1.getDay());

  const grid: (HeatmapDay & { col: number; row: number; isoDate: string } | null)[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: typeof grid[0] = [];
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + w * 7 + d);
      if (date.getFullYear() !== year) {
        week.push(null);
      } else {
        const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        const data = map.get(iso) ?? { date: iso, count: 0 };
        week.push({ ...data, col: w, row: d, isoDate: iso });
      }
    }
    grid.push(week);
  }
  return { grid, startDay };
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function monthLabels(year: number, startDay: Date) {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < WEEKS; w++) {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + w * 7);
    if (date.getFullYear() === year && date.getMonth() !== lastMonth) {
      lastMonth = date.getMonth();
      labels.push({ label: MONTH_NAMES[date.getMonth()], col: w });
    }
  }
  return labels;
}

function tooltipText(cell: { isoDate: string; count: number; breakdown?: HeatmapDay['breakdown'] }) {
  if (cell.count === 0) return `No activity on ${cell.isoDate}`;
  const parts: string[] = [];
  if (cell.breakdown?.submissions) parts.push(`${cell.breakdown.submissions} submission${cell.breakdown.submissions !== 1 ? 's' : ''}`);
  if (cell.breakdown?.messages) parts.push(`${cell.breakdown.messages} message${cell.breakdown.messages !== 1 ? 's' : ''}`);
  if (cell.breakdown?.reviews) parts.push(`${cell.breakdown.reviews} review${cell.breakdown.reviews !== 1 ? 's' : ''}`);
  if (cell.breakdown?.milestones) parts.push(`${cell.breakdown.milestones} milestone${cell.breakdown.milestones !== 1 ? 's' : ''}`);
  const detail = parts.length ? ` (${parts.join(', ')})` : '';
  return `${cell.count} activit${cell.count !== 1 ? 'ies' : 'y'} on ${cell.isoDate}${detail}`;
}

export default function ActivityHeatmap({ days, year, label }: Props) {
  const { grid, startDay } = buildGrid(year, days);
  const mLabels = monthLabels(year, startDay);

  const svgW = DAY_LABEL_W + WEEKS * CELL;
  const svgH = MONTH_LABEL_H + DAYS * CELL;

  const total = days.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
          <span className="text-xs text-gray-400">{total} activit{total !== 1 ? 'ies' : 'y'} in {year}</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white p-4">
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block', minWidth: svgW }}
          aria-label={`Activity heatmap for ${year}`}
        >
          {/* Month labels */}
          {mLabels.map(({ label: ml, col }) => (
            <text
              key={`m-${col}`}
              x={DAY_LABEL_W + col * CELL}
              y={MONTH_LABEL_H - 6}
              fontSize={10}
              fill="#57606a"
            >
              {ml}
            </text>
          ))}

          {/* Day-of-week labels (Mon / Wed / Fri) */}
          {[1, 3, 5].map((dow) => (
            <text
              key={`d-${dow}`}
              x={0}
              y={MONTH_LABEL_H + dow * CELL + CELL - 3}
              fontSize={9}
              fill="#57606a"
            >
              {DAY_NAMES[dow].slice(0, 3)}
            </text>
          ))}

          {/* Cells */}
          {grid.map((week, wi) =>
            week.map((cell, di) => {
              if (!cell) return null;
              const cx = DAY_LABEL_W + wi * CELL;
              const cy = MONTH_LABEL_H + di * CELL;
              const color = COLOR_SCALE[countToLevel(cell.count)];
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={cx}
                  y={cy}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={2}
                  fill={color}
                >
                  <title>{tooltipText(cell)}</title>
                </rect>
              );
            })
          )}
        </svg>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
          <span>Less</span>
          {COLOR_SCALE.map((c, i) => (
            <svg key={i} width={11} height={11}>
              <rect width={11} height={11} rx={2} fill={c} />
            </svg>
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
