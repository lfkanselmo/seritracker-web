export interface GenreStat {
  genre: string;
  episodeCount: number;
}

export interface YearSummary {
  year: number;
  episodesWatched: number;
  topGenres: GenreStat[];
  mostWatchedSeriesTitle: string | null;
  mostWatchedSeriesEpisodeCount: number | null;
  longestStreakDays: number;
}

export type BadgeCode =
  | 'FIRST_EPISODE'
  | 'BINGE_WATCHER'
  | 'TRUE_FAN'
  | 'FIRST_COMPLETE'
  | 'COLLECTOR'
  | 'WEEK_STREAK'
  | 'MONTH_STREAK'
  | 'GENRE_EXPLORER';

export interface Badge {
  code: BadgeCode;
  earned: boolean;
  progressCurrent: number;
  progressTarget: number;
}

export interface UserStats {
  totalEpisodesWatched: number;
  totalMinutesWatched: number;
  totalSeriesTracked: number;
  totalSeriesCompleted: number;
  currentStreakDays: number;
  badges: Badge[];
  currentYear: YearSummary;
}

export const BADGE_ICONS: Record<BadgeCode, string> = {
  FIRST_EPISODE: 'play_circle',
  BINGE_WATCHER: 'local_movies',
  TRUE_FAN: 'favorite',
  FIRST_COMPLETE: 'check_circle',
  COLLECTOR: 'collections_bookmark',
  WEEK_STREAK: 'local_fire_department',
  MONTH_STREAK: 'whatshot',
  GENRE_EXPLORER: 'explore',
};
