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

export interface UpdateEpisodesRequest {
  watchedEpisodes: number;
}

export const STATUS_CONFIG: Record<SeriesStatus, { label: string; color: string; icon: string }> = {
  WATCHING:      { label: 'Viendo',      color: 'accent',  icon: 'play_arrow' },
  WANT_TO_WATCH: { label: 'Por ver',     color: 'primary', icon: 'bookmark'   },
  COMPLETED:     { label: 'Completada',  color: 'warn',    icon: 'check'      },
  ABANDONED:     { label: 'Abandonada',  color: 'warn',    icon: 'close'      },
};