/*
  # Create films table for tracking watched movies

  1. New Tables
    - `films`
      - `id` (bigint, primary key)
      - `tmdb_id` (integer, unique) - The Movie DB ID
      - `title` (text) - Film title
      - `poster_path` (text) - Poster image path from TMDB
      - `backdrop_path` (text) - Backdrop image path from TMDB  
      - `overview` (text) - Film synopsis
      - `release_date` (date) - Release date
      - `vote_average` (real) - TMDB rating
      - `runtime` (integer) - Duration in minutes
      - `genres` (text[]) - Array of genre names
      - `origin_country` (text[]) - Array of origin countries
      - `trailer_key` (text) - YouTube trailer key
      - `created_at` (timestamptz) - When film was added to collection

  2. Security
    - Enable RLS on `films` table
    - Add policy for public access (since no user authentication required)
*/

CREATE TABLE IF NOT EXISTS films (
  id bigserial PRIMARY KEY,
  tmdb_id integer UNIQUE NOT NULL,
  title text NOT NULL,
  poster_path text DEFAULT '',
  backdrop_path text DEFAULT '',
  overview text DEFAULT '',
  release_date date NOT NULL,
  vote_average real DEFAULT 0,
  runtime integer DEFAULT 0,
  genres text[] DEFAULT '{}',
  origin_country text[] DEFAULT '{}',
  trailer_key text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE films ENABLE ROW LEVEL SECURITY;

-- Allow public access to all films (no user authentication required)
CREATE POLICY "Public access to films"
  ON films
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS films_tmdb_id_idx ON films (tmdb_id);
CREATE INDEX IF NOT EXISTS films_created_at_idx ON films (created_at DESC);