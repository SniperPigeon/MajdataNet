import { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useI18n } from '@/hooks/useI18n';
import { RadarRequestError, useChartRadar } from '@/hooks/useChartRadar';
import { radarAxes } from '@/utils/radar';
import type { ChartRadarResponse } from '@/types/radar';
import radarBackground from '@/assets/radar/MajRadarBG.png';

interface ChartRadarProps {
  id: string;
  hash: string;
  chartLevel: number | undefined;
}

// 100 reaches the reference hexagon. Labels leave room for roughly 220;
// higher scores still extend linearly instead of changing the scale.
const RADAR_CENTER_X = 160;
const RADAR_CENTER_Y = 180;
const REFERENCE_RADIUS = 64;
const REFERENCE_SCORE = 100;
const LABEL_POSITIONS = [
  { x: 160, y: 20, anchor: 'middle' },
  { x: 316, y: 76, anchor: 'end' },
  { x: 316, y: 286, anchor: 'end' },
  { x: 160, y: 340, anchor: 'middle' },
  { x: 4, y: 286, anchor: 'start' },
  { x: 4, y: 76, anchor: 'start' },
] as const;

function RadarPlot({ data }: { data: ChartRadarResponse }) {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  // Access by key: JSON dictionary iteration order is not the visual axis order.
  const values = radarAxes.map(axis => data.feature[axis.key]);
  const complete = values.every((value): value is number => value !== null);
  const strongest = complete ? values.indexOf(Math.max(...values)) : 0;
  const color = radarAxes[strongest];
  const points = values.map((value, i) => {
    const angle = (-90 + i * 60) * Math.PI / 180;
    const radius = Math.max(0, value ?? 0) / REFERENCE_SCORE * REFERENCE_RADIUS;
    return `${RADAR_CENTER_X + Math.cos(angle) * radius},${RADAR_CENTER_Y + Math.sin(angle) * radius}`;
  }).join(' ');
  const esti = data.feature.fitted_constant;

  return (
    <svg viewBox="0 0 320 360" className="block w-full text-white/90" role="img" aria-labelledby={titleId}>
      <title id={titleId}>
        {radarAxes.map((axis, i) => `${axis.label}: ${values[i] ?? '—'}`).join(', ')}; esti: {esti?.toFixed(2) ?? '—'}
      </title>
      {complete && (
        <motion.polygon
          initial={reduceMotion ? false : { points: Array(6).fill(`${RADAR_CENTER_X},${RADAR_CENTER_Y}`).join(' ') }}
          animate={{ points, fill: color.fill, stroke: color.stroke }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.215, 0.61, 0.355, 1] }}
          fillOpacity={0.7843}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      <image
        href={radarBackground}
        x={RADAR_CENTER_X - REFERENCE_RADIUS}
        y={RADAR_CENTER_Y - REFERENCE_RADIUS}
        width={REFERENCE_RADIUS * 2}
        height={REFERENCE_RADIUS * 2}
        className="invert opacity-65"
      />
      {radarAxes.map((axis, i) => {
        const { x, y, anchor } = LABEL_POSITIONS[i];
        return (
          <g key={axis.key} textAnchor={anchor} fill="currentColor">
            <text x={x} y={y - 2} fontSize="15" fontWeight="600">{axis.label}</text>
            <text x={x} y={y + 14} fontSize="14" className="tabular-nums">{values[i]?.toFixed(0) ?? '—'}</text>
          </g>
        );
      })}
      <text x={RADAR_CENTER_X} y={RADAR_CENTER_Y + 4} textAnchor="middle" fontSize="26" fontWeight="600" fill="currentColor" stroke="rgb(0 0 0 / 35%)" strokeWidth="3" paintOrder="stroke" className="tabular-nums">
        {esti?.toFixed(2) ?? '—'}
      </text>
      <text x={RADAR_CENTER_X} y={RADAR_CENTER_Y + 24} textAnchor="middle" fontSize="13" fill="currentColor">esti</text>
    </svg>
  );
}

export default function ChartRadar({ id, hash, chartLevel }: ChartRadarProps) {
  const { i18n } = useI18n();
  const titleId = useId();
  const { data, error, isLoading, isValidating, mutate } = useChartRadar(id, hash, chartLevel);
  let message: string | undefined;
  if (chartLevel === undefined) message = i18n('song/ChartRadar.NoDifficulty', '暂无可用难度');
  else if (error instanceof RadarRequestError && error.status === 404) message = i18n('song/ChartRadar.Unavailable', '该难度暂无雷达数据');
  else if (error instanceof RadarRequestError && error.status === 422) message = i18n('song/ChartRadar.AnalysisFailed', '该难度暂时无法分析');
  else if (error) message = i18n('song/ChartRadar.LoadFailed', '雷达加载失败');
  else if (isLoading) message = i18n('song/ChartRadar.Loading', '正在分析谱面…');

  return (
    <section aria-labelledby={titleId} className="bg-white/8 shadow-[0_4px_15px_rgb(0_0_0/0.2)] backdrop-blur-[10px] p-3 sm:p-4 border border-white/10 rounded-2xl min-w-0">
      <h3 id={titleId} className="m-0 mb-3 font-bold text-white text-sm">{i18n('song/ChartRadar.Title', '谱面雷达')}</h3>
      {message ? (
        <div className="flex flex-col justify-center items-center gap-3 aspect-square text-center text-white/70 text-sm" aria-live="polite" aria-busy={isLoading || isValidating}>
          <p role={error ? 'alert' : 'status'}>{message}</p>
          {error && <button type="button" disabled={isValidating} onClick={() => { void mutate().catch(() => {}); }} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg disabled:opacity-50">
            {i18n('song/ChartRadar.Retry', '重试')}
          </button>}
        </div>
      ) : data ? (
        <div className="rounded-xl overflow-hidden">
          <RadarPlot data={data} />
        </div>
      ) : null}
    </section>
  );
}
