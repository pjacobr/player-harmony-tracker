export type FilterMetric = 'winRate' | 'gamesPlayed' | 'avgKDA';

export type MetricRanges = {
  [key in FilterMetric]: {
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
  };
};

export interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    winRate: number;
    gamesPlayed: number;
    avgKDA: number;
  }>;
}