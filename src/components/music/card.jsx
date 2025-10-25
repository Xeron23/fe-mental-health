"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaPlay } from "react-icons/fa6";

const MusicCard = ({
  playlists = [],
  favorites = [],
  searchTerm = "",
  onPlay,
}) => {
  const scrollRefs = useRef([]);
  const [scrollState, setScrollState] = useState({});

  const combinedLists = React.useMemo(() => {
    const arr = [];
    if (favorites && favorites.length > 0) {
      arr.push({
        category: "Favorites",
        tracks: favorites,
        _isFavorites: true,
      });
    }

    playlists.forEach((p) => {
      if (p.tracks && p.tracks.length > 0) {
        arr.push({ ...p, _isFavorites: false });
      }
    });
    return arr;
  }, [playlists, favorites]);

  const scroll = (idx, dir) => {
    const container = scrollRefs.current[idx];
    if (container) {
      container.scrollBy({
        left: dir === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = (idx) => {
    const el = scrollRefs.current[idx];
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const isAtStart = scrollLeft <= 5;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;
      setScrollState((prev) => ({
        ...prev,
        [idx]: { isAtStart, isAtEnd },
      }));
    }
  };

  useEffect(() => {
    setTimeout(() => {
      combinedLists.forEach((_, idx) => handleScroll(idx));
    }, 50);
  }, [combinedLists.length]);

  const filterTracks = (tracks) => {
    if (!searchTerm || !searchTerm.trim()) return tracks || [];
    const lower = searchTerm.toLowerCase();
    return (tracks || []).filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(lower)) ||
        (t.artist && t.artist.toLowerCase().includes(lower)) ||
        (t.description && t.description.toLowerCase().includes(lower))
    );
  };

  const findPlaylistIndex = (category) => {
    return playlists.findIndex((p) => p.category === category);
  };

  if (combinedLists.length === 0) {
    return (
      <div className="text-center py-10 text-neut-600">
        No music available
      </div>
    );
  }

  return (
    <>
      {combinedLists.map((list, idx) => {
        const { isAtStart, isAtEnd } = scrollState[idx] || {};
        const visibleTracks = filterTracks(list.tracks);

        if (searchTerm && searchTerm.trim() && visibleTracks.length === 0) {
          return null;
        }

        return (
          <section key={`${list.category}-${idx}`} className="mb-12 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold text-neut-900">
                {list.category}
              </h2>

              {visibleTracks.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll(idx, "left")}
                    className={`p-1 rounded-full bg-primary-500 hover:bg-primary-600 transition flex items-center justify-center 
                      ${
                        isAtStart
                          ? "opacity-40 cursor-not-allowed"
                          : "opacity-100 animate-pulse-slow"
                      }`}
                    disabled={isAtStart}
                  >
                    <FaChevronLeft className="w-4 h-4 text-white" />
                  </button>

                  <button
                    onClick={() => scroll(idx, "right")}
                    className={`p-1 rounded-full bg-primary-500 hover:bg-primary-600 transition flex items-center justify-center 
                      ${
                        isAtEnd
                          ? "opacity-40 cursor-not-allowed"
                          : "opacity-100 animate-pulse-slow"
                      }`}
                    disabled={isAtEnd}
                  >
                    <FaChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              {!isAtStart && visibleTracks.length > 0 && (
                <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-white via-white/70 to-transparent pointer-events-none z-10" />
              )}

              {!isAtEnd && visibleTracks.length > 0 && (
                <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white via-white/70 to-transparent pointer-events-none z-10" />
              )}

              <div
                ref={(el) => (scrollRefs.current[idx] = el)}
                onScroll={() => handleScroll(idx)}
                className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar pb-3 transition-all duration-300"
              >
                {visibleTracks.map((track, i) => (
                  <div
                    key={track.id || `${list.category}-${i}`}
                    className="min-w-[260px] max-w-[260px] flex-shrink-0 bg-white rounded-lg rounded-t-sm shadow-[0_1px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_20px_rgba(0,0,0,0.12)] transition overflow-hidden cursor-pointer"
                    onClick={() =>
                      onPlay &&
                      onPlay(track, {
                        type: list._isFavorites ? "favorites" : "category",
                        categoryIdx: list._isFavorites
                          ? null
                          : findPlaylistIndex(list.category),
                      })
                    }
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={track.thumbnail || "/placeholder.jpg"}
                        alt={track.title || "Music track"}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay &&
                            onPlay(track, {
                              type: list._isFavorites ? "favorites" : "category",
                              categoryIdx: list._isFavorites
                                ? null
                                : findPlaylistIndex(list.category),
                            });
                        }}
                        className="group absolute -bottom-5 right-6 bg-white hover:bg-primary-500 shadow-md hover:shadow-lg transition-all duration-300 rounded-full p-3 flex items-center justify-center cursor-pointer"
                      >
                        <FaPlay className="w-4 h-4 text-neut-600 transition-colors duration-300 group-hover:text-white" />
                      </button>
                    </div>

                    <div className="p-4 mt-4">
                      <p className="text-sm text-primary-500 font-medium mb-1">
                        New For You
                      </p>
                      <h3 className="font-semibold text-neut-900 text-base line-clamp-2">
                        {track.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-neut-600 mt-1 line-clamp-2">
                        {track.artist || track.description || "No description"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};

export default MusicCard;