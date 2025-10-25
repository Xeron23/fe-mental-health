"use client";
import React, { useEffect, useState, useCallback } from "react";
import Upper from "./upper";
import Choices from "./options";
import request from "@/utils/request";
import toast from "react-hot-toast";

const Visualize = () => {
  const [activeTab, setActiveTab] = useState("journal");
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = "";
      const dateParam = selectedDate
        ? new Date(selectedDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (activeTab === "journal") {
        url = `/statistic/journal-stats?tgl=${dateParam}`;
      } else {
        url = `/statistic/face-stats?tgl=${dateParam}`;
      }

      const response = await request.get(url);
      let rawData;

      if (activeTab === "journal") {
        rawData = response.data?.data?.mood || response.data?.data;
      } else {
        rawData =
          response.data?.data?.face ||
          response.data?.data?.mood ||
          response.data?.data;
      }

      // pastikan data array
      let dataArray = Array.isArray(rawData)
        ? rawData
        : rawData
        ? [rawData]
        : [];

      // Jika data kosong untuk tanggal tertentu
      if (!dataArray || dataArray.length === 0) {
        setSummary([]);
      } else {
        setSummary(dataArray);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setSummary([]);
      } else {
        toast.error("Gagal mengambil data");
      }
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedDate, fetchData]);

  const fetchDetailById = async (id) => {
    try {
      const url =
        activeTab === "journal" ? `/journal/${id}` : `/face-detection/${id}`;
      const response = await request.get(url);
      setSelectedItem(response.data?.data);
    } catch (err) {
      console.error("Gagal ambil detail:", err);
      toast.error("Gagal mengambil data detail.");
    }
  };

  return (
    <>
      <Upper setSelectedDate={setSelectedDate} />
      <Choices activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-col gap-5 mt-6">
        {loading ? (
          <p className="text-gray-500 text-center mt-10">Memuat data...</p>
        ) : activeTab === "journal" ? (
          summary.length > 0 ? (
            summary.map((item, index) => (
              <div
                key={index}
                onClick={() =>
                  fetchDetailById(
                    activeTab === "journal"
                      ? item.journal_id
                      : item.detection_id
                  )
                }
                className="flex justify-between items-center border border-blue-400 rounded-4xl px-10 py-5 transition-shadow cursor-pointer hover:shadow-md"
              >
                <div className="flex flex-row md:flex-col items-start pl-10 w-1/5">
                  <h2 className="text-2xl font-bold text-primary-500">
                    {item.mood === "joy"
                      ? "Bahagia"
                      : item.mood === "sad"
                      ? "Sedih"
                      : item.mood === "anger"
                      ? "Marah"
                      : item.mood === "fear"
                      ? "Takut"
                      : item.mood === "disgust"
                      ? "Jijik"
                      : item.mood === "surprise"
                      ? "Terkejut"
                      : item.mood || "-"}
                  </h2>
                </div>

                <div className="flex-1 text-gray-700 leading-relaxed text-sm">
                  {item.content || "Tidak ada deskripsi untuk entri ini."}
                </div>

                <div className="w-1/6 text-right font-bold text-neut-600">
                  {activeTab === "journal"
                    ? item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("id-ID")
                      : "-"
                    : item.detectedAt
                    ? new Date(item.detectedAt).toLocaleDateString("id-ID")
                    : "-"}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-10">
              Belum ada data Jurnal untuk tanggal ini.
            </p>
          )
        ) : summary.length > 0 ? (
          summary.map((item, index) => (
            <div
              key={index}
              onClick={() =>
                fetchDetailById(
                  activeTab === "journal" ? item.journal_id : item.detection_id
                )
              }
              className="flex justify-between items-center border border-blue-400 rounded-4xl px-10 py-5 transition-shadow cursor-pointer hover:shadow-md"
            >
              <div className="flex flex-col items-start pl-10 w-1/5">
                <h2 className="text-2xl font-bold text-primary-500">
                  {item.mood === "joy"
                    ? "Bahagia"
                    : item.mood === "sad"
                    ? "Sedih"
                    : item.mood === "anger"
                    ? "Marah"
                    : item.mood === "fear"
                    ? "Takut"
                    : item.mood === "disgust"
                    ? "Jijik"
                    : item.mood === "surprise"
                    ? "Terkejut"
                    : item.mood || "-"}
                </h2>
              </div>

              <div
                className={`flex-1 text-gray-700 leading-relaxed text-sm ${
                  activeTab !== "journal" ? "hidden" : ""
                }`}
              >
                {activeTab === "journal"
                  ? item.content || "Tidak ada deskripsi untuk entri ini."
                  : item.imageUrl
                  ? `Gambar: ${item.imageUrl.split("/").pop()}`
                  : "Tidak ada gambar untuk deteksi ini."}
              </div>

              <div className="w-1/6 text-right font-bold text-neut-600">
                {activeTab === "journal"
                  ? item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("id-ID")
                    : "-"
                  : item.detectedAt
                  ? new Date(item.detectedAt).toLocaleDateString("id-ID")
                  : "-"}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-10">
            Belum ada data Face Detection untuk tanggal ini.
          </p>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[500px]">
            <h2 className="text-xl font-bold mb-2 text-primary-500">
              {selectedItem.mood === "joy"
                ? "Bahagia"
                : selectedItem.mood === "sad"
                ? "Sedih"
                : selectedItem.mood === "anger"
                ? "Marah"
                : selectedItem.mood === "fear"
                ? "Takut"
                : selectedItem.mood === "disgust"
                ? "Jijik"
                : selectedItem.mood === "surprise"
                ? "Terkejut"
                : selectedItem.mood || "Tanpa Mood"}
            </h2>
            <p className="text-gray-700">
              {activeTab === "journal"
                ? selectedItem.content || "Tidak ada detail."
                : selectedItem.imageUrl
                ? `Gambar: ${selectedItem.imageUrl}`
                : "Tidak ada detail."}
            </p>
            <div className="text-right">
              <button
                onClick={() => setSelectedItem(null)}
                className="mt-5 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Visualize;
