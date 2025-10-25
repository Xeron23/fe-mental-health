"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import request from "@/utils/request";
import { formatWaktu } from "@/utils/time";
import NewsCard from "@/components/berita/card";
import { FaCalendar } from "react-icons/fa6";
import Navbar from "@/components/navbar/page";
import Breadcrumb from "@/components/breadcrumb/page";
import Footer from "@/components/footer/page";


const NewsDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await request.get(`/mindful-news/${id}`);
        const data = res.data?.data;

        setArticle({
          id: data.news_id,
          title: data.title,
          description: data.description,
          content: data.content,
          imageUrl: data.imageUrl?.startsWith("http")
            ? data.imageUrl
            : `${process.env.NEXT_PUBLIC_API_URL}${data.imageUrl}`,
          readingTime: data.readingTime,
          date: formatWaktu(data.createdAt),
          author: data.author || "Administrator",
          authorRole: data.role || "Redaksi Mindful Media",
        });
      } catch (err) {
        console.error("Gagal ambil detail berita:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) return <p className="text-center py-10">Loading...</p>;

  if (!article)
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <p className="text-gray-500">Berita tidak ditemukan.</p>
      </div>
    );

  return (
    <>
      <Navbar/>
      <div className="p-6 md:px-20 md:py-12">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Berita" },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold leading-snug text-gray-900 mb-6">
          {article.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
          <FaCalendar />
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readingTime} menit baca</span>
        </div>

        <div className="w-full mb-8">
          <Image
            src={article.imageUrl}
            alt={article.title}
            width={1200}
            height={600}
            className="rounded-lg object-cover w-full h-auto max-h-[560px]"
            priority
            unoptimized
          />
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/assets/icons/profile.svg"
            alt="Author Avatar"
            width={42}
            height={42}
            className="rounded-full border border-gray-200"
            unoptimized
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">
              {article.author}
            </span>
            <span className="text-sm text-gray-500">{article.authorRole}</span>
          </div>
        </div>

        <article className="text-gray-800 leading-relaxed space-y-5 text-justify">
          {article.content.split("\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </article>

        <div className="mt-20 max-w-full">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Berita Lainnya
          </h2>
        </div>
        <NewsCard />

      </div>
        <Footer/>
    </>
  );
};

export default NewsDetail;
``;
