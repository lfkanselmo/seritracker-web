export type SeriesStatus = 'WATCHING' | 'WANT_TO_WATCH' | 'COMPLETED' | 'ABANDONED';

export interface UserSeries {
  id: number;
  tmdbId: number;
  title: string;
  posterUrl: string;
  status: SeriesStatus;
  rating: number | null;
  watchedEpisodes: number;
  totalEpisodes: number;
  network: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TmdbSeries {
  tmdbId: number;
  title: string;
  posterUrl: string | null;
  genres: string[];
  network: string | null;
  totalEpisodes: number;
}

export interface CreateSeriesRequest {
  tmdbId: number;
  status: SeriesStatus;
}

export interface UpdateStatusRequest {
  status: SeriesStatus;
}

export interface UpdateRatingRequest {
  rating: number;
}

export interface UpdateNotesRequest {
  notes: string;
}

export type SeriesSortBy = 'TITLE' | 'RATING' | 'CREATED_AT' | 'UPDATED_AT';
export type SortDirection = 'ASC' | 'DESC';

export interface SeasonProgress {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  watchedCount: number;
}

export interface NextEpisode {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string | null;
}

export interface SeasonsSummary {
  seasons: SeasonProgress[];
  nextEpisode: NextEpisode | null;
}

export interface EpisodeInfo {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string | null;
  watched: boolean;
}

export const STATUS_CONFIG: Record<SeriesStatus, { color: string; icon: string }> = {
  WATCHING: { color: 'accent', icon: 'play_arrow' },
  WANT_TO_WATCH: { color: 'primary', icon: 'bookmark' },
  COMPLETED: { color: 'warn', icon: 'check' },
  ABANDONED: { color: 'warn', icon: 'close' },
};

export interface Notification {
  id: number;
  tmdbId: number;
  seriesTitle: string;
  episodeCode: string;
  airDate: string;
  sentAt: string;
  read: boolean;
  isToday: boolean;
  isTomorrow: boolean;
}