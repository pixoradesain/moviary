const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
const BASE_URL = "https://api.themoviedb.org/3";

// Fallback bearer token (kept for local dev if VITE_TMDB_API_KEY is not set)
const FALLBACK_BEARER =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNDA2YTNlNDUxZjc0NjEzM2QzMjk5NmUzMGVlYjk4NSIsIm5iZiI6MTUzMTUwNjc0Mi42ODUsInN1YiI6IjViNDhmMDM2YzNhMzY4NDUyZDAwZTdlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Y79gp5dxM4slMHKuJZZQii7qu6aSHtcDYM53L9r2GD8";

const headersWithBearer = {
  Authorization: `Bearer ${FALLBACK_BEARER}`,
  "Content-Type": "application/json",
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean>
) {
  const url = new URL(`${BASE_URL}${path}`);
  if (TMDB_API_KEY) {
    url.searchParams.set("api_key", String(TMDB_API_KEY));
  }
  if (params) {
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    );
  }
  return url.toString();
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: { id: number; name: string }[];
  origin_country: string[];
}

export interface TMDBSearchResult {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
}

export const searchMovies = async (
  query: string
): Promise<TMDBSearchResult[]> => {
  if (!query || !query.trim()) return [];

  const url = buildUrl("/search/movie", {
    query: query.trim(),
    language: "en-US",
    page: 1,
  });
  const res = await fetch(url, {
    headers: TMDB_API_KEY ? jsonHeaders : headersWithBearer,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `TMDB search failed: ${res.status} ${res.statusText} ${text}`
    );
  }
  const data = await res.json();
  return (data.results || []).slice(0, 10);
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  const url = buildUrl(`/movie/${movieId}`, { language: "en-US" });
  const res = await fetch(url, {
    headers: TMDB_API_KEY ? jsonHeaders : headersWithBearer,
  });
  if (!res.ok) throw new Error(`Failed to get movie details (${res.status})`);
  return res.json();
};

export const getMovieTrailer = async (movieId: number): Promise<string> => {
  const url = buildUrl(`/movie/${movieId}/videos`, { language: "en-US" });
  const res = await fetch(url, {
    headers: TMDB_API_KEY ? jsonHeaders : headersWithBearer,
  });
  if (!res.ok) return "";
  const data = await res.json();
  const trailer = (data.results || []).find(
    (video: any) => video.type === "Trailer" && video.site === "YouTube"
  );
  return trailer?.key || "";
};

export const getImageUrl = (path: string, size: string = "w500") => {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Fetch movie details using a language override and attempt to return localized title/overview/poster/backdrop
export const getLocalizedMovie = async (movieId: number, lang: string) => {
  if (!movieId) return null;

  const detailsUrl = buildUrl(`/movie/${movieId}`, { language: lang });
  const imagesUrl = buildUrl(`/movie/${movieId}/images`);

  const [detailsRes, imagesRes]: [Response, Response] = await Promise.all([
    fetch(detailsUrl, {
      headers: TMDB_API_KEY ? jsonHeaders : headersWithBearer,
    }),
    fetch(imagesUrl, {
      headers: TMDB_API_KEY ? jsonHeaders : headersWithBearer,
    }),
  ]);

  if (!detailsRes.ok)
    throw new Error(`Failed to fetch localized details (${detailsRes.status})`);
  const details = await detailsRes.json();

  let posterPath = details.poster_path;
  if (imagesRes.ok) {
    const images = await imagesRes.json();
    const posters: any[] = images.posters || [];
    const localizedPoster =
      posters.find((p) => p.iso_639_1 === lang) ||
      posters.find((p) => p.iso_639_1 === null);
    posterPath = localizedPoster?.file_path || posterPath;
  }

  return {
    title: details.title,
    overview: details.overview,
    poster_path: posterPath,
    backdrop_path: details.backdrop_path,
  };
};
