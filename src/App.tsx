import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { AddFilmPage } from "./pages/AddFilmPage";
import { ExportPage } from "./pages/ExportPage";

function App() {
  const [searchHandler, setSearchHandler] = useState<
    ((query: string) => void) | null
  >(null);

  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Header onSearch={(query) => searchHandler?.(query)} />

        <Routes>
          <Route path="/" element={<HomePage onSearch={setSearchHandler} />} />
          <Route path="/add" element={<AddFilmPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
