import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useAudio } from "../../context/AudioContext";
import { useAuth } from "../../context/AuthContext";
import {
  getBeats,
  toggleFavorite,
  getUserById,
  getGenre,
  api,
} from "../../helper/api";
import type { Beat } from "../../types/beat";
import type { User } from "../../types/user";
import placeholder from "../../assets/placeholder.png";
import avatar from "../../assets/avatar.png";
import { Link, useParams } from "react-router-dom";
import {
  FaTrash,
  FaEdit,
  FaCloudUploadAlt,
  FaHeart,
  FaMusic,
  FaHashtag,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { BeatKeys, type BeatKey } from "../producer/UploadBeat";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const toBeatKey = (key: string | undefined): BeatKey =>
  key && BeatKeys.includes(key as BeatKey) ? (key as BeatKey) : "C";

export default function ProducerPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const [beats, setBeats] = useState<
    Array<Beat & { favoriteCount: number; isFavorite: boolean }>
  >([]);
  const [producer, setProducer] = useState<User | null>(null);
  const [genresMap, setGenresMap] = useState<Map<number, string>>(new Map());
  const [allGenres, setAllGenres] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [myId, setMyId] = useState<number | null>(null);
  const { audioRef, playingId, setPlayingId } = useAudio();

  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [beatToDelete, setBeatToDelete] = useState<number | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [editForm, setEditForm] = useState<{
    title: string;
    bpm: number | "";
    beatKey: BeatKey;
    price: number | "";
    coverFile: File | null;
    coverPreview: string | null;
    selectedGenres: number[];
  }>({
    title: "",
    bpm: "",
    beatKey: "C",
    price: "",
    coverFile: null,
    coverPreview: null,
    selectedGenres: [],
  });

  const owner = myId !== null && Number(id) === myId;

  useEffect(() => {
    if (editingBeat || beatToDelete) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [editingBeat, beatToDelete]);

  useEffect(() => {
    if (!accessToken) return;
    const fetchInitialData = async () => {
      try {
        const [meRes, genreRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/genres"),
        ]);
        setMyId(meRes.data.id);
        setAllGenres(genreRes.data);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      }
    };
    fetchInitialData();
  }, [accessToken]);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const producerData = await getUserById(Number(id));
        setProducer(producerData);

        const allBeats = await getBeats();
        const producerBeats = allBeats
          .filter((b) => b.producerId === Number(id))
          .map((b) => ({
            ...b,
            genres: b.genres ?? [],
            favoriteCount: b.favoriteCount ?? 0,
            isFavorite: Boolean(b.isFavorite),
            beatKey: toBeatKey(b.beatKey),
          }));
        setBeats(producerBeats);
      } catch (err) {
        setError("Profil yüklenirken bir hata oluştu.");
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchGenres = async () => {
      const uniqueGenreIds = Array.from(
        new Set(beats.flatMap((b) => b.genres ?? [])),
      );
      if (uniqueGenreIds.length === 0) return;

      const newMap = new Map(genresMap);
      let needsUpdate = false;

      await Promise.all(
        uniqueGenreIds.map(async (genreId) => {
          if (!newMap.has(genreId)) {
            const name = await getGenre(genreId);
            newMap.set(genreId, name);
            needsUpdate = true;
          }
        }),
      );
      if (needsUpdate) setGenresMap(newMap);
    };
    if (beats.length > 0) fetchGenres();
  }, [beats]);

  const getGenreName = (genreId: number) =>
    genresMap.get(genreId) ?? `Genre ${genreId}`;

  const handleFavorite = async (beatId: number) => {
    const targetBeat = beats.find((b) => b.id === beatId);
    if (!targetBeat) return;
    const isAdding = !targetBeat.isFavorite;

    setBeats((prev) =>
      prev.map((b) =>
        b.id === beatId
          ? {
              ...b,
              isFavorite: !b.isFavorite,
              favoriteCount: b.isFavorite
                ? Math.max(0, b.favoriteCount - 1)
                : b.favoriteCount + 1,
            }
          : b,
      ),
    );
    try {
      await toggleFavorite(beatId);
      if (isAdding) toast.success("Favorilere eklendi ❤️");
    } catch (err) {
      toast.error("İşlem başarısız.");
    }
  };

  const handleDelete = async (beatId: number) => {
    try {
      await api.delete(`/beats/${beatId}`);
      setBeats((prev) => prev.filter((b) => b.id !== beatId));
      toast.success("Beat başarıyla silindi.");
      setBeatToDelete(null);
    } catch {
      toast.error("Beat silinirken bir hata oluştu.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !editingBeat) return;
    setUpdateLoading(true);

    const formData = new FormData();
    formData.append("title", editForm.title);
    formData.append("beatKey", editForm.beatKey);
    if (editForm.bpm !== "") formData.append("bpm", editForm.bpm.toString());
    if (editForm.price !== "")
      formData.append("price", editForm.price.toString());
    if (editForm.coverFile) formData.append("coverUrl", editForm.coverFile);
    formData.append("genreIds", editForm.selectedGenres.join(","));

    try {
      const res = await api.patch(`/beats/${editingBeat.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedBeat = res.data;
      const newMap = new Map(genresMap);
      const normalizedGenreIds: number[] = [];
      if (Array.isArray(updatedBeat.genres)) {
        updatedBeat.genres.forEach((g: any) => {
          if (typeof g === "object" && g !== null) {
            newMap.set(g.id, g.name);
            normalizedGenreIds.push(g.id);
          } else normalizedGenreIds.push(g);
        });
      }
      setGenresMap(newMap);

      setBeats((prev) =>
        prev.map((b) =>
          b.id === updatedBeat.id
            ? {
                ...b,
                ...updatedBeat,
                genres: normalizedGenreIds,
                beatKey: toBeatKey(updatedBeat.beatKey),
              }
            : b,
        ),
      );

      toast.success("Beat başarıyla güncellendi! ✨");
      setEditingBeat(null);
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      toast.error("Hata oluştu.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePlayPause = (beat: Beat) => {
    if (!beat.audioUrl) return;
    const audioPath = `${API_BASE_URL}/${beat.audioUrl.replaceAll("\\", "/")}`;
    if (playingId === beat.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = new Audio(audioPath);
    audioRef.current.play().catch(console.error);
    setPlayingId(beat.id);
    audioRef.current.onended = () => setPlayingId(null);
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEditForm((prev) => ({
      ...prev,
      coverFile: file,
      coverPreview: file ? URL.createObjectURL(file) : prev.coverPreview,
    }));
  };

  if (error)
    return (
      <div className="p-8 text-red-500 text-center font-bold">{error}</div>
    );
  if (!producer)
    return (
      <div className="p-8 text-white italic text-center animate-pulse">
        Yükleniyor...
      </div>
    );

  return (
    <>
      <div
        className={`transition-all duration-500 ${
          editingBeat || beatToDelete
            ? "blur-xl scale-95 pointer-events-none"
            : ""
        }`}
      >
        <div className="h-48 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-gray-800" />
        <div className="max-w-7xl mx-auto px-8 -mt-24 pb-20">
          <div className="flex flex-col lg:flex-row gap-10">
            <aside className="lg:w-1/4">
              <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl sticky top-28 flex flex-col items-center text-center">
                <img
                  src={
                    producer.profileImage
                      ? `${API_BASE_URL}/${producer.profileImage.replaceAll(
                          "\\",
                          "/",
                        )}`
                      : avatar
                  }
                  alt={producer.username}
                  className="w-40 h-40 rounded-full object-cover border-4 border-gray-800 shadow-2xl"
                />
                <h2 className="text-3xl font-black mt-6 text-white tracking-tighter">
                  {producer.username}
                </h2>
                <span className="text-blue-500 font-bold text-xs uppercase tracking-widest mt-1">
                  Verified Producer
                </span>
                <div className="grid grid-cols-2 w-full gap-4 mt-8">
                  <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <p className="text-2xl font-black text-white">
                      {beats.length}
                    </p>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-tighter">
                      Beats
                    </p>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <p className="text-2xl font-black text-white">
                      {beats.reduce((sum, b) => sum + b.favoriteCount, 0)}
                    </p>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-tighter">
                      Likes
                    </p>
                  </div>
                </div>
                {owner && (
                  <Link to="/upload" className="w-full mt-8">
                    <button className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40 tracking-tight">
                      <FaCloudUploadAlt /> YENİ BEAT YÜKLE
                    </button>
                  </Link>
                )}
              </div>
            </aside>

            <main className="lg:flex-1">
              <div className="flex items-center gap-5 mb-10">
                <div className="relative flex items-center justify-center w-12 h-12">
                  <div className="absolute inset-0 bg-blue-500 opacity-[0.08] blur-xl rounded-full" />
                  <div className="relative bg-gray-900 border border-gray-800 p-3 rounded-2xl text-blue-500 shadow-inner">
                    <FaMusic size={18} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase italic">
                    Tüm Eserler
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-[1px] w-8 bg-blue-500/50" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                      Katalog
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {beats.map((beat) => (
                  <div
                    key={beat.id}
                    className={`group bg-gray-900/40 border rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col ${
                      playingId === beat.id
                        ? "border-blue-500 shadow-blue-900/20 ring-1 ring-blue-500"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={
                          beat.coverUrl
                            ? `${API_BASE_URL}/${beat.coverUrl.replaceAll(
                                "\\",
                                "/",
                              )}`
                            : placeholder
                        }
                        alt={beat.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(beat.id);
                        }}
                        className={`absolute top-4 right-4 px-2.5 py-1.5 rounded-xl text-white text-xs flex items-center gap-2 z-10 transition-all border shadow-lg ${
                          beat.isFavorite
                            ? "bg-red-600 border-red-400/20 hover:bg-red-500"
                            : "bg-black/60 backdrop-blur-md border-white/10 hover:bg-black/80"
                        }`}
                      >
                        <FaHeart
                          className={
                            beat.isFavorite ? "text-white" : "text-white/40"
                          }
                        />
                        <span className="font-bold tracking-tighter">
                          {beat.favoriteCount}
                        </span>
                      </button>

                      <div
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white backdrop-blur-[2px]"
                        onClick={() => handlePlayPause(beat)}
                      >
                        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:scale-110 hover:bg-white/20 transition-all duration-300 shadow-2xl">
                          {playingId === beat.id ? (
                            <FaPause className="text-2xl animate-pulse" />
                          ) : (
                            <FaPlay className="text-2xl ml-1" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="text-xl font-bold text-white truncate mb-1 tracking-tight">
                        {beat.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                        <span>{beat.bpm} BPM</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full" />
                        <span className="text-blue-500">{beat.beatKey}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(beat.genres ?? []).map((genreId) => (
                          <span
                            key={genreId}
                            className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/10 font-bold"
                          >
                            {getGenreName(genreId)}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-800/50">
                        <div className="flex gap-4">
                          {owner && (
                            <>
                              <button
                                onClick={() => setBeatToDelete(beat.id)}
                                className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-red-900/20 hover:text-red-500 transition-all border border-gray-700"
                              >
                                <FaTrash size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBeat(beat);
                                  setEditForm({
                                    title: beat.title,
                                    bpm: beat.bpm ?? "",
                                    beatKey: toBeatKey(beat.beatKey),
                                    price: beat.price ?? "",
                                    coverFile: null,
                                    coverPreview: beat.coverUrl
                                      ? `${API_BASE_URL}/${beat.coverUrl.replaceAll(
                                          "\\",
                                          "/",
                                        )}`
                                      : null,
                                    selectedGenres: beat.genres ?? [],
                                  });
                                }}
                                className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-yellow-900/20 hover:text-yellow-500 transition-all border border-gray-700"
                              >
                                <FaEdit size={14} />
                              </button>
                            </>
                          )}
                        </div>
                        <span className="text-lg font-black text-white">
                          {beat.price ? `${beat.price} ₺` : "FREE"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>

      {beatToDelete && (
        <div className="fixed inset-0 bg-[#0a0a0c]/90 backdrop-blur-xl flex items-center justify-center z-[300] p-6">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2.5rem] w-full max-w-sm shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
            <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 text-red-500">
              <FaTrash className="text-3xl" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter mb-2 italic">
              EMİN MİSİN?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Bu beat kalıcı olarak silinecek. Bu işlemi geri alamazsın.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setBeatToDelete(null)}
                className="flex-1 p-4 rounded-2xl bg-gray-800 text-gray-400 font-bold hover:bg-gray-700 transition-all"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(beatToDelete)}
                className="flex-1 p-4 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-900/30 transition-all"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {editingBeat && (
        <div className="fixed inset-0 bg-[#0a0a0c]/90 backdrop-blur-xl flex items-center justify-center z-[200] p-6">
          <div className="bg-gray-900 border border-gray-800 p-10 rounded-[3rem] w-full max-w-lg shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
                EDIT Studio
              </h2>
              <button
                onClick={() => setEditingBeat(null)}
                className="text-gray-500 hover:text-white transition-all text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-8">
              <div className="flex justify-center">
                <div className="relative group w-32 h-32">
                  <img
                    src={editForm.coverPreview || placeholder}
                    className="w-full h-full object-cover rounded-3xl border-2 border-gray-800 shadow-lg"
                    alt="Preview"
                  />
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-3xl cursor-pointer">
                    <FaCloudUploadAlt size={24} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <FaHashtag size={10} className="text-blue-500" /> Başlık
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white focus:border-blue-500 transition-all outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                      BPM
                    </label>
                    <input
                      type="number"
                      value={editForm.bpm}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          bpm: Number(e.target.value),
                        }))
                      }
                      className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                      Key
                    </label>
                    <select
                      value={editForm.beatKey}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          beatKey: toBeatKey(e.target.value),
                        }))
                      }
                      className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white outline-none cursor-pointer"
                    >
                      {BeatKeys.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                    Türler
                  </label>
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-950/50 rounded-2xl border border-gray-800 max-h-40 overflow-y-auto shadow-inner">
                    {allGenres.map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() =>
                          setEditForm((p) => ({
                            ...p,
                            selectedGenres: p.selectedGenres.includes(g.id)
                              ? p.selectedGenres.filter((i) => i !== g.id)
                              : [...p.selectedGenres, g.id],
                          }))
                        }
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                          editForm.selectedGenres.includes(g.id)
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                            : "border-gray-800 text-gray-500 hover:border-gray-600"
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
                    Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full p-4 rounded-2xl bg-gray-800 border border-gray-700 text-white shadow-inner"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBeat(null)}
                  className="flex-1 p-4 rounded-2xl border border-gray-800 text-gray-500 font-bold hover:bg-gray-800 transition-all hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 p-4 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-xl transition-all disabled:opacity-50"
                >
                  {updateLoading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
