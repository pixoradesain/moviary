import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { searchMovies, getMovieDetails, getMovieTrailer, getImageUrl, TMDBSearchResult } from '../lib/tmdb';
import { supabase, Film } from '../lib/supabase';

export const AddFilmPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addingMovieId, setAddingMovieId] = useState<number | null>(null);
  
  // Import functionality
  const [isImporting, setIsImporting] = useState(false);
  const [importedMovies, setImportedMovies] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addFilm = async (movie: TMDBSearchResult) => {
    setIsAdding(true);
    setAddingMovieId(movie.id);
    try {
      // Check if film already exists
      const { data: existingFilm } = await supabase
        .from('films')
        .select('id')
        .eq('tmdb_id', movie.id)
        .single();

      if (existingFilm) {
        alert('This film is already in your collection!');
        return;
      }

      // Get detailed movie information
      const details = await getMovieDetails(movie.id);
      const trailerKey = await getMovieTrailer(movie.id);

      const filmData: Omit<Film, 'id' | 'created_at'> = {
        tmdb_id: details.id,
        title: details.title,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        overview: details.overview,
        release_date: details.release_date,
        vote_average: details.vote_average,
        runtime: details.runtime,
        genres: details.genres.map(g => g.name),
        origin_country: details.origin_country,
        trailer_key: trailerKey,
      };

      const { error } = await supabase
        .from('films')
        .insert([filmData]);

      if (error) throw error;

      // Show success message and redirect after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error adding film:', error);
      alert('Failed to add film. Please try again.');
    } finally {
      setIsAdding(false);
      setAddingMovieId(null);
    }
  };

  const importFromFlicktionary = async () => {
    setIsImporting(true);
    setImportStatus('idle');
    setImportMessage('');
    
    try {
      // Fetch movie titles from Flicktionary
      const response = await fetch('https://flicktionary.vercel.app/api/movies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch movies from Flicktionary');
      }
      
      const data = await response.json();
      const movieTitles = data.movies || [];
      
      if (movieTitles.length === 0) {
        setImportStatus('error');
        setImportMessage('No movies found on Flicktionary');
        return;
      }

      let successCount = 0;
      let skipCount = 0;
      
      for (const title of movieTitles) {
        try {
          // Search for the movie on TMDB
          const searchResults = await searchMovies(title);
          
          if (searchResults.length > 0) {
            const movie = searchResults[0]; // Take the first result
            
            // Check if film already exists
            const { data: existingFilm } = await supabase
              .from('films')
              .select('id')
              .eq('tmdb_id', movie.id)
              .single();

            if (existingFilm) {
              skipCount++;
              continue;
            }

            // Get detailed movie information
            const details = await getMovieDetails(movie.id);
            const trailerKey = await getMovieTrailer(movie.id);

            const filmData: Omit<Film, 'id' | 'created_at'> = {
              tmdb_id: details.id,
              title: details.title,
              poster_path: details.poster_path,
              backdrop_path: details.backdrop_path,
              overview: details.overview,
              release_date: details.release_date,
              vote_average: details.vote_average,
              runtime: details.runtime,
              genres: details.genres.map(g => g.name),
              origin_country: details.origin_country,
              trailer_key: trailerKey,
            };

            const { error } = await supabase
              .from('films')
              .insert([filmData]);

            if (!error) {
              successCount++;
              setImportedMovies(prev => [...prev, details.title]);
            }
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error importing ${title}:`, error);
        }
      }
      
      setImportStatus('success');
      setImportMessage(`Successfully imported ${successCount} movies. ${skipCount} movies were already in your collection.`);
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportMessage('Failed to import movies from Flicktionary. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Add Films to Your Collection</h1>
          <p className="text-slate-400">Search for films or import from your Flicktionary collection</p>
        </div>

        {/* Import Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Import from Flicktionary</h2>
          <p className="text-slate-300 mb-4">
            Import all your watched movies from flicktionary.vercel.app to save time
          </p>
          
          <button
            onClick={importFromFlicktionary}
            disabled={isImporting}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isImporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isImporting ? 'Importing...' : 'Import Movies'}</span>
          </button>

          {importStatus !== 'idle' && (
            <div className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
              importStatus === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
            }`}>
              {importStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p>{importMessage}</p>
                {importedMovies.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm opacity-80">Imported movies:</p>
                    <div className="mt-1 text-sm opacity-70">
                      {importedMovies.slice(0, 5).join(', ')}
                      {importedMovies.length > 5 && ` and ${importedMovies.length - 5} more...`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Manual Search Section */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Search and Add Films</h2>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for a film to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 animate-spin" />
            )}
          </div>

          <div className="space-y-3">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center space-x-4 bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition-colors"
              >
                <img
                  src={getImageUrl(movie.poster_path, 'w92')}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-white font-medium text-lg">{movie.title}</h3>
                  <p className="text-slate-300 text-sm">
                    {new Date(movie.release_date).getFullYear()}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-slate-300 text-sm">
                      {movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addFilm(movie)}
                  disabled={isAdding && addingMovieId === movie.id}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-slate-900 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isAdding && addingMovieId === movie.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add to Collection</span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No films found for "{searchQuery}". Try a different search term.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};