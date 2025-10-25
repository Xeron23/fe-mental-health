"use client";
import { useState, useEffect, useCallback } from "react";
import Button from "../button/page";
import Image from "next/image";
import request from "@/utils/request";
import { formatWaktu } from "@/utils/time";
import Link from "next/link";

const NewsCard = () => {
  const [articles, setArticles] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMindfulNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request.get("/mindful-news?page=1");
      const ress = await request.get("/mindful-news?page=2");
      const rawData = res.data?.data;
      const rawDataa = ress.data?.data;

      const list = Array.isArray(rawData)
        ? rawData
        : rawData?.data && Array.isArray(rawData.data)
        ? rawData.data
        : [];

      const listt = Array.isArray(rawDataa)
        ? rawDataa
        : rawDataa?.data && Array.isArray(rawDataa.data)
        ? rawDataa.data
        : [];

      const combinedList = [...list, ...listt];

      const mapped = combinedList.map((item) => ({
        id: item.news_id,
        title: item.title,
        description: item.description,
        date: formatWaktu(item.createdAt),
        imageUrl: item.imageUrl?.startsWith("http")
          ? item.imageUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`,
        readingTime: item.readingTime,
        role: item.role || "Administrator",
        jobdesk: item.jobdesk || "Copywriter",
        thumbnail: item.thumbnailUrl?.startsWith("http")
          ? item.thumbnailUrl
          : `${process.env.NEXT_PUBLIC_API_URL}${item.thumbnailUrl}`,
      }));

      setArticles(mapped);
    } catch (err) {
      if (err.response?.status === 404) {
        setArticles([]);
      } else {
        console.error("Gagal ambil data berita:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMindfulNews();
  }, [fetchMindfulNews]);

  if (loading) return <p>Loading...</p>;
  if (!articles.length) return <p>Belum ada berita tersedia.</p>;

  const displayedNews = expanded ? articles : articles.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedNews.map((article) => (
          <div
            key={article.id}
            style={{ boxShadow: "0px 14px 50px rgba(197, 236, 255, 0.5)" }}
            className="bg-white rounded-lg overflow-hidden pt-4 flex flex-col h-full"
          >
            <div className="w-full px-4">
              <div className="relative w-full aspect-[16/9] overflow-hidden rounded-sm bg-gray-100">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover object-center"
                  unoptimized
                />
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
                  {article.date}
                </div>

                <h3 className="font-semibold text-base leading-snug text-neut-900 line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-neut-600 text-sm line-clamp-3">
                  {article.description}
                </p>
              </div>

              <div className="mt-auto ">
                <div className="flex flex-row gap-3 mt-4 ">
                  <Image
                    src={article.imageUrl}
                    alt="Profile"
                    width={40}
                    height={40}
                    priority
                    unoptimized
                    className="rounded-full object-cover"
                  />
                  <div className="flex flex-col items-start justify-center">
                    <div className="text-sm font-semibold text-neut-900 text-left">
                      {article.role}
                    </div>
                    <div className="text-sm font-semilight text-neut-600 text-left">
                      {article.jobdesk}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-neut-200 flex items-center justify-between">
                  <span className="text-gray-500 text-sm font-semibold">
                    {article.readingTime} Menit Baca
                  </span>
                  <Link href={`/dashboard/mindful-news/${article.id}`}>
                    <Button text="Baca Selengkapnya" variant="primary" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
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

export default NewsCard;
