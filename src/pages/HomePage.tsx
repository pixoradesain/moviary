import React, { useState, useEffect } from 'react';
import { FilmGrid } from '../components/FilmGrid';
import { FilmDetails } from '../components/FilmDetails';
import { supabase, Film } from '../lib/supabase';

interface HomePageProps {
  onSearch: (handler: ((query: string) => void) | null) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSearch }) => {
  const [films, setFilms] = useState<Film[]>([]);
  const [filteredFilms, setFilteredFilms] = useState<Film[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilms();
  }, []);

  useEffect(() => {
    setFilteredFilms(films);
  }, [films]);

  useEffect(() => {
    const handleSearch = (query: string) => {
      if (!query || !query.trim()) {
        setFilteredFilms(films);
        return;
      }

      const filtered = films.filter(film =>
        film.title.toLowerCase().includes(query.toLowerCase()) ||
        film.genres.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredFilms(filtered);
    };

    onSearch(() => handleSearch);
  }, [films, onSearch]);

  const loadFilms = async () => {
    try {
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFilms(data || []);
    } catch (error) {
      console.error('Error loading films:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (film: Film) => {
    setSelectedFilm(film);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your film collection...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Your Film Collection</h2>
        <p className="text-slate-400">
          {films.length} film{films.length !== 1 ? 's' : ''} watched
        </p>
      </div>

      <FilmGrid
        films={filteredFilms}
        onViewDetails={handleViewDetails}
      />

      {selectedFilm && (
        <FilmDetails
          film={selectedFilm}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </main>
  );
};