"use client";
import React, { useState, useEffect, useCallback } from "react";
import request from "@/utils/request";
import { formatWaktu } from "@/utils/time";
import Link from "next/link";

const VideoCards = () => {
  const [videos, setVideos] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res1 = await request.get("/video?page=1");
      const res2 = await request.get("/video?page=2");

      const rawData1 = res1.data?.data;
      const rawData2 = res2.data?.data;

      const list1 = Array.isArray(rawData1)
        ? rawData1
        : rawData1?.data && Array.isArray(rawData1.data)
        ? rawData1.data
        : [];

      const list2 = Array.isArray(rawData2)
        ? rawData2
        : rawData2?.data && Array.isArray(rawData2.data)
        ? rawData2.data
        : [];

      const combinedList = [...list1, ...list2];

      const mapped = combinedList.map((item) => ({
        id: item.video_id,
        title: item.title,
        description: item.description,
        date: formatWaktu(item.createdAt),
        videoUrl: item.videoUrl?.startsWith("http")
          ? item.videoUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${item.videoUrl}`,
      }));

      setVideos(mapped);
    } catch (err) {
      if (err.response?.status === 404) {
        setVideos([]);
      } else {
        console.error("Gagal ambil data video:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  function getYouTubeId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  const displayedVideos = expanded ? videos : videos.slice(0, 4);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-5 text-center">
        <p className="text-gray-500">Memuat video...</p>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-2 py-5 text-center">
        <p className="text-gray-500">Tidak ada video ditemukan.</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedVideos.map((video) => (
          <Link
            key={video.id}
            href={`/dashboard/video/${video.id}`}
            className="bg-white rounded-xl pt-4 border-2 border-transparent hover:border-primary-500 transition overflow-hidden flex-[1_1_calc(25%-1.5rem)] cursor-pointer h-auto"
            style={{ boxShadow: "0px 14px 50px rgba(197, 236, 255, 0.3)" }}
          >
            <div className="w-full px-4">
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-sm bg-gray-100">
                <img
                  src={`https://img.youtube.com/vi/${getYouTubeId(
                    video.videoUrl
                  )}/hqdefault.jpg`}
                  alt={video.title}
                  className="object-cover object-center w-full h-full cursor-pointer"
                />

                <button className="absolute inset-0 flex items-center justify-center cursor-pointer">
                  <img
                    src="/assets/icons/play.svg"
                    alt="Play"
                    className="w-10 h-10"
                  />
                </button>
              </div>
            </div>

            <div className="p-4 flex flex-col h-full">
              <div className="flex flex-col gap-3">
                <div className="flex items-center text-neut-500 text-sm gap-2">
                  <img
                    src={"/assets/icons/calendar.svg"}
                    alt="calendar"
                    className="w-4 h-4"
                  />
                  {video.date}
                </div>

                <h3 className="font-semibold text-base leading-snug text-neut-900 line-clamp-2">
                  {video.title}
                </h3>

                <p className="text-neut-600 text-sm line-clamp-3">
                  {video.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-end items-end mt-10 border-t border-neut-50 pt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition cursor-pointer"
        >
          {expanded ? "Lebih Sedikit" : "Lihat Semua"}
        </button>
      </div>
    </section>
  );
};

export default VideoCards;
