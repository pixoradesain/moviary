import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;
export let SUPABASE_CONFIGURED = false;

if (!supabaseUrl || !supabaseKey) {
  const msg =
    "Variabel lingkungan VITE_SUPABASE_URL dan/atau VITE_SUPABASE_ANON_KEY tidak ditemukan. \n" +
    "Di pengaturan Netlify, tambahkan dua Environment Variables ini agar Supabase berfungsi saat deploy. \n" +
    "Sementara, aplikasi akan berjalan dengan data kosong (fallback) agar tidak crash.";
  console.warn(msg);

  const makeChain = (result = { data: [], error: null }) => {
    const api: any = {};
    api.select = (_cols?: string) => api;
    api.order = (_col?: string, _opts?: any) => api;
    api.eq = (_col?: string, _val?: any) => api;
    api.limit = (_n?: number) => api;
    api.insert = async (_rows: any) => ({ data: [], error: null });
    api.update = (_row: any) => ({
      eq: (_c: string, _v: any) => Promise.resolve({ data: [], error: null }),
    });
    api.delete = () => ({
      eq: (_c: string, _v: any) => Promise.resolve({ data: [], error: null }),
    });
    api.then = (resolve: any) => Promise.resolve(result).then(resolve);
    api.catch = (fn: any) => Promise.resolve(result).catch(fn);
    return api;
  };

  const fakeClient: any = {
    from: (_table: string) => makeChain(),
    auth: {
      getUser: async () => ({ data: null, error: null }),
    },
  };

  supabase = fakeClient;
  SUPABASE_CONFIGURED = false;
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
  SUPABASE_CONFIGURED = true;
}

export { supabase };

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
