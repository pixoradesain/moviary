import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Film {
  id?: number;
  tmdb_id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime: number;
  genres: string[];
  origin_country: string[];
  trailer_key: string;
  created_at?: string;
  storage_locations?: string[]; // new: list of storage locations (e.g., terabox accounts/paths)
}
