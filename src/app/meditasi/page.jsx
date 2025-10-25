"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/page";
import Breadcrumb from "@/components/breadcrumb/page";
import MusicCard from "@/components/music/card";
import Player from "@/components/music/player";
import Footer from "@/components/footer/page";
import SearchBar from "@/components/music/search";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
import request from "@/utils/request";

const Meditasi = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentPlaylistContext, setCurrentPlaylistContext] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeditations = async () => {
      try {
        const [resMeditasi, resAlam] = await Promise.all([
          request.get("/meditation?type=meditasi"),
          request.get("/meditation?type=alam"),
        ]);

        if (resMeditasi.code !== 200 || resAlam.code !== 200)
          throw new Error("Gagal fetch data");

        const playlistsData = [
          {
            category: "Meditasi",
            tracks: resMeditasi.data.map((item) => ({
              id: item.meditation_id,
              title: item.title,
              description: item.description,
              thumbnail: item.thumbnailUrl,
              mediaUrl: item.mediaUrl,
              duration: item.duration,
              type: item.type,
            })),
          },
          {
            category: "Alam",
            tracks: resAlam.data.map((item) => ({
              id: item.meditation_id,
              title: item.title,
              description: item.description,
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
        if (res.code === 200 && Array.isArray(res.data)) {
          const mapped = res.data.map((item) => ({
            id: item.meditation_id,
            title: item.title,
            description: item.description,
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

  const _keyOf = (t) => (t.id ? `${t.id}` : `${t.title}||${t.artist}`);

  
  const toggleFavorite = async (track) => {
    const key = _keyOf(track);
    const exists = favorites.some((f) => _keyOf(f) === key);

    try {
      if (exists) {
        // hapus dari favorite
        await request.delete(`/meditation/meditate-favorite/${track.id}`);
        setFavorites((prev) => prev.filter((f) => _keyOf(f) !== key));
      } else {
        // tambahkan ke favorite
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
      const list = playlists[idx];
      return list ? list.tracks : null;
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

  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

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
            <p className="text-center text-neut-600">Loading...</p>
          ) : (
            <MusicCard
              playlists={playlists}
              favorites={favorites}
              searchTerm={searchTerm}
              onPlay={(track, ctx) => handlePlay(track, ctx)}
            />
          )}

          <Player
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handlePauseToggle}
            onToggleFavorite={() =>
              currentTrack && toggleFavorite(currentTrack)
            }
            isFavorite={
              currentTrack
                ? favorites.some((f) => _keyOf(f) === _keyOf(currentTrack))
                : false
            }
            onNext={handleNext}
            onPrev={handlePrev}
          />

          {currentTrack && (
            <div className="hidden">
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${getYouTubeId(
                  currentTrack.mediaUrl
                )}`}
                playing={isPlaying}
                controls={false}
                width="0"
                height="0"
                volume={0.8}
                onEnded={handleNext}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Meditasi;
