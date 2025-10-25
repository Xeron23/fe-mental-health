"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/page";
import Breadcrumb from "@/components/breadcrumb/page";
import MusicCard from "@/components/music/card";
import Player from "@/components/music/player";
import Footer from "@/components/footer/page";
import SearchBar from "@/components/music/search";
import request from "@/utils/request";

const Meditasi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentPlaylistContext, setCurrentPlaylistContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeditations = async () => {
      try {
        const [resMeditasi, resAlam] = await Promise.all([
          request.get("/meditation?type=meditasi"),
          request.get("/meditation?type=alam"),
        ]);

        const playlistsData = [
          {
            category: "Meditasi",
            tracks: (resMeditasi.data?.data || []).map((item) => ({
              id: item.meditation_id,
              title: item.title,
              description: item.description,
              artist: item.description,
              thumbnail: item.thumbnailUrl,
              mediaUrl: item.mediaUrl,
              duration: item.duration,
              type: item.type,
            })),
          },
          {
            category: "Alam",
            tracks: (resAlam.data?.data || []).map((item) => ({
              id: item.meditation_id,
              title: item.title,
              description: item.description,
              artist: item.description,
              thumbnail: item.thumbnailUrl,
              mediaUrl: item.mediaUrl,
              duration: item.duration,
              type: item.type,
            })),
          },
        ];

        setPlaylists(playlistsData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal memuat data meditasi.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeditations();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await request.get("/meditation/meditate-favorite");
        if (Array.isArray(res.data)) {
          const mapped = res.data.map((item) => ({
            id: item.meditation_id,
            title: item.title,
            description: item.description,
            artist: item.description,
            thumbnail: item.thumbnailUrl,
            mediaUrl: item.mediaUrl,
            duration: item.duration,
            type: item.type,
          }));
          setFavorites(mapped);
        }
      } catch (e) {
        console.error("Gagal fetch favorites:", e);
      }
    };

    fetchFavorites();
  }, []);

  const _keyOf = (t) => `${t.id || t.title}`;

  const toggleFavorite = async (track) => {
    const key = _keyOf(track);
    const exists = favorites.some((f) => _keyOf(f) === key);

    try {
      if (exists) {
        await request.delete(`/meditation/meditate-favorite/${track.id}`);
        setFavorites((prev) => prev.filter((f) => _keyOf(f) !== key));
      } else {
        await request.post("/meditation/meditate-favorite", {
          meditation_id: track.id,
        });
        setFavorites((prev) => [track, ...prev]);
      }
    } catch (err) {
      console.error("Gagal ubah favorite:", err);
    }
  };

  const handlePlay = (track, context) => {
    setCurrentTrack(track);
    setCurrentPlaylistContext(context || null);
    setIsPlaying(true);
  };

  const handlePauseToggle = () => setIsPlaying((s) => !s);

  const getCurrentPlaylistArray = () => {
    if (!currentPlaylistContext) return null;
    if (currentPlaylistContext.type === "favorites") return favorites;
    if (currentPlaylistContext.type === "category") {
      const idx = currentPlaylistContext.categoryIdx;
      return playlists[idx]?.tracks || null;
    }
    return null;
  };

  const handleNext = () => {
    const arr = getCurrentPlaylistArray();
    if (!arr || !currentTrack) return;
    const idx = arr.findIndex((t) => _keyOf(t) === _keyOf(currentTrack));
    const next = arr[idx + 1] || arr[0];
    if (next) handlePlay(next, currentPlaylistContext);
  };

  const handlePrev = () => {
    const arr = getCurrentPlaylistArray();
    if (!arr || !currentTrack) return;
    const idx = arr.findIndex((t) => _keyOf(t) === _keyOf(currentTrack));
    const prev = arr[idx - 1] || arr[arr.length - 1];
    if (prev) handlePlay(prev, currentPlaylistContext);
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-6 md:px-20 md:py-12">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Meditasi" },
            ]}
          />
          <div className="text-center text-red-500 py-10">{error}</div>
        </div>
        <Footer />
      </>
    );
  }


  useEffect(() => {
    console.log("Current track changed:", currentTrack);
  }, [currentTrack]);

  useEffect(() => {
    console.log("Playing state changed:", isPlaying);
  }, [isPlaying]);

  return (
    <>
      <Navbar />
      <div className="p-6 md:px-20 md:py-12">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Meditasi" },
          ]}
        />

        <div className="mt-10">
          <SearchBar onSearch={setSearchTerm} />

          {loading ? (
            <p className="text-center text-neutral-600">Loading...</p>
          ) : (
            <MusicCard
              playlists={playlists}
              favorites={favorites}
              searchTerm={searchTerm}
              onPlay={(track, ctx) => handlePlay(track, ctx)}
            />
          )}

          {currentTrack && (
            <Player
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTogglePlay={handlePauseToggle}
              onToggleFavorite={() => toggleFavorite(currentTrack)}
              isFavorite={favorites.some(
                (f) => _keyOf(f) === _keyOf(currentTrack)
              )}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Meditasi;
