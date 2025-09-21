const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNDA2YTNlNDUxZjc0NjEzM2QzMjk5NmUzMGVlYjk4NSIsIm5iZiI6MTUzMTUwNjc0Mi42ODUsInN1YiI6IjViNDhmMDM2YzNhMzY4NDUyZDAwZTdlZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Y79gp5dxM4slMHKuJZZQii7qu6aSHtcDYM53L9r2GD8';
const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  'Authorization': `Bearer ${TMDB_API_KEY}`,
  'Content-Type': 'application/json',
};

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

export const searchMovies = async (query: string): Promise<TMDBSearchResult[]> => {
  if (!query.trim()) return [];
  
  const response = await fetch(
    `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
    { headers }
  );
  
  if (!response.ok) throw new Error('Failed to search movies');
  
  const data = await response.json();
  return data.results.slice(0, 10);
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?language=en-US`,
    { headers }
  );
  
  if (!response.ok) throw new Error('Failed to get movie details');
  
  return response.json();
};

export const getMovieTrailer = async (movieId: number): Promise<string> => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?language=en-US`,
    { headers }
  );
  
  if (!response.ok) throw new Error('Failed to get movie videos');
  
  const data = await response.json();
  const trailer = data.results.find((video: any) => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );
  
  return trailer?.key || '';
};

export const getImageUrl = (path: string, size: string = 'w500') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};