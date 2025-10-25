"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import request from "@/utils/request";
import { formatWaktu } from "@/utils/time";
import AddJournalCard from "@/components/journal/cardAddJournal";
import JournalCard from "@/components/journal/cardJournal";
import Navbar from "@/components/navbar/page";
import Breadcrumb from "@/components/breadcrumb/page";
import Modal from "@/components/modal/page";
import { HiOutlineDotsVertical } from "react-icons/hi";
import toast from "react-hot-toast";

const SmartJournaling = () => {
  const router = useRouter();
  const [fetchJournal, setFetchJournal] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    if (selectMode) setSelectedIds([]);
  };

  const onSelectedJournal = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onDeleteJournal = async () => {
    try {
      await Promise.all(
        selectedIds.map((id) => request.delete(`/journal/${id}`))
      );
      toast.success("Jurnal berhasil dihapus");
      setFetchJournal((prev) =>
        prev.filter((j) => !selectedIds.includes(j.journal_id))
      );
      fetchAllJournal();
    } catch (err) {
      toast.error("Jurnal gagal dihapus");
    } finally {
      setOpenModal(false);
      setSelectedIds([]);
      setSelectMode(false);
    }
  };

  const fetchAllJournal = useCallback(async () => {
    setLoading(true);
    try {
      const response = await request.get("/journal");
      const data = response.data.data?.data;

      const userId = parseInt(localStorage.getItem("userId"));
      const userJournal = Array.isArray(data)
        ? data
        : data
        ? [data]
        : []
        ? data.filter((j) => j.userId === userId)
        : [];

      setFetchJournal(userJournal);
    } catch (err) {
      if (err.response && err.response.status == 404) {
        setFetchJournal([]);
      } else {
        toast.error("Gagal mengambil data jurnal");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllJournal();
  }, [fetchAllJournal]);

  return (
    <div>
      <Navbar />
      <div className="p-6 md:px-20 md:py-12">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Jurnal Pintar" },
          ]}
        />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Jurnal Pintar</h1>

          <div className="flex flex-row items-center gap-4">
            {selectMode && selectedIds.length > 0 && (
              <button
                onClick={() => setOpenModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Hapus yang Dipilih
              </button>
            )}

            <HiOutlineDotsVertical
              className="text-neut-950 text-2xl cursor-pointer"
              onClick={toggleSelectMode}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[280px]">
          <AddJournalCard
            onClick={() => router.push("/smartJournaling/addJournal")}
          />
          {Array.isArray(fetchJournal) && fetchJournal.length > 0 ? (
            fetchJournal.map((journal) => (
              <JournalCard
                key={journal.journal_id}
                title={journal.title}
                description={journal.content}
                date={formatWaktu(journal.updatedAt, "date")}
                selected={selectedIds.includes(journal.journal_id)}
                onSelect={() => onSelectedJournal(journal.journal_id)}
                selectMode={selectMode}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Belum ada jurnal.
            </p>
          )}
        </div>
      </div>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={onDeleteJournal}
        title="Apakah Anda yakin ingin menghapus jurnal ini?"
        description="Jurnal ini akan dihapus secara permanen dan tidak dapat dipulihkan."
      />
    </div>
  );
};

export default SmartJournaling;
