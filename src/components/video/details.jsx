"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import request from "@/utils/request";

const VideoPage = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchVideoDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await request.get(`/video/${id}`);
        setVideo(res.data?.data);
      } catch (error) {
        console.error("Error fetching video detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetail();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-gray-600 text-lg">Loading video...</p>
      </div>
    );

  if (!video)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-gray-600 text-lg">Video tidak ditemukan.</p>
      </div>
    );

  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = getYouTubeId(video.videoUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="w-full aspect-video rounded-xl overflow-hidden mb-6">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={video.title}
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        ) : (
          <p className="text-center text-gray-500">Video tidak tersedia</p>
        )}
      </div>

      <h1 className="text-xl md:text-2xl font-semibold mb-3 text-left">
        {video.title}
      </h1>

      <div className="bg-neut-100 rounded-2xl max-w-full h-30 p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-900">
          Dipublikasikan pada{" "}
          {new Date(video.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-gray-700 leading-relaxed text-sm md:text-lg mb-6">
          {video.description}
        </p>
      </div>
    </div>
  );
};

export default VideoPage;
