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

export interface UserStats {
  totalEpisodesWatched: number;
  totalMinutesWatched: number;
  totalSeriesTracked: number;
  totalSeriesCompleted: number;
  currentYear: YearSummary;
}
