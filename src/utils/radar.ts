import type { RadarAxis } from '@/types/radar';

// Clockwise from the top. Colors match MajdataPlay Assets/Scenes/List.unity.
export const radarAxes: { key: RadarAxis; label: string; fill: string; stroke: string }[] = [
  { key: 'note', label: 'Note', fill: '#ecb47b', stroke: '#da6e00' },
  { key: 'peak', label: 'Peak', fill: '#dd8377', stroke: '#c73320' },
  { key: 'sweep', label: 'Swipe', fill: '#ea98bb', stroke: '#dc5690' },
  { key: 'slide_tricky', label: 'Umiyuri', fill: '#b2cfe0', stroke: '#005f97' },
  { key: 'slide_sequence', label: 'Dense', fill: '#7bc4c5', stroke: '#008d8f' },
  { key: 'jack', label: 'Jack', fill: '#a484d7', stroke: '#9772d1' },
];

export function getDefaultChartLevel(levels: (string | null)[]): number | undefined {
  return [4, 5, 6, 3, 2, 1, 0].find(index => levels[index]?.trim());
}
