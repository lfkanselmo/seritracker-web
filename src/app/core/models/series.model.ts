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

export const STATUS_CLASS: Record<SeriesStatus, string> = {
  WATCHING: 'watching',
  WANT_TO_WATCH: 'want-to',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

export function calculateProgressPercent(watchedEpisodes: number, totalEpisodes: number): number {
  if (!totalEpisodes) return 0;
  return Math.round((watchedEpisodes / totalEpisodes) * 100);
}

export function formatEpisodeCode(seasonNumber: number, episodeNumber: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `S${pad(seasonNumber)}E${pad(episodeNumber)}`;
}

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

export interface UpcomingEpisode {
  userSeriesId: number;
  tmdbId: number;
  seriesTitle: string;
  posterUrl: string | null;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle: string;
  airDate: string;
  isToday: boolean;
  isTomorrow: boolean;
}