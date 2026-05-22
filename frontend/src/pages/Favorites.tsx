import { useState, useEffect, type Key } from "react";
import { useAudio } from "../context/AudioContext";
import { getBeats, toggleFavorite, getGenre } from "../helper/api";
import type { Beat } from "../types/beat";
import placeholder from "../assets/placeholder.png";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart, FaMusic, FaPlay, FaPause } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Favorites() {
  const [beats, setBeats] = useState<
    Array<Beat & { favoriteCount: number; isFavorite: boolean }>
  >([]);
  const [genresMap, setGenresMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const { audioRef, playingId, setPlayingId } = useAudio();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getBeats();
        const favorites = (data as Array<Beat>)
          .filter((b) => Boolean(b.isFavorite))
          .map((b) => ({
            ...b,
            genres: b.genres ?? [],
            favoriteCount: b.favoriteCount ?? 0,
            isFavorite: true,
          }));
        setBeats(favorites);
      } catch (err) {
        console.error("Favoriler yüklenemedi:", err);
        toast.error("Favori beatler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchGenres = async () => {
      const uniqueGenreIds = Array.from(
        new Set(beats.flatMap((b) => b.genres ?? [])),
      );
      if (uniqueGenreIds.length === 0) return;

      const map = new Map<number, string>(genresMap);
      let needsUpdate = false;

      await Promise.all(
        uniqueGenreIds.map(async (id) => {
          if (!map.has(id)) {
            const name = await getGenre(id);
            map.set(id, name);
            needsUpdate = true;
          }
        }),
      );
      if (needsUpdate) setGenresMap(map);
    };

    if (beats.length > 0) fetchGenres();
  }, [beats]);

  const getGenreName = (id: Key | null | undefined) => {
    if (typeof id !== "number") return "Unknown";
    return genresMap.get(id) ?? `Genre ${id}`;
  };

  const handleRemoveFavorite = async (beatId: number) => {
    setBeats((prev) => prev.filter((b) => b.id !== beatId));

    try {
      await toggleFavorite(beatId);
      toast.info("Favorilerden kaldırıldı.");
    } catch (err) {
      toast.error("İşlem başarısız oldu.");
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

  if (loading)
    return (
      <div className="p-12 text-white text-center italic animate-pulse">
        Favoriler yükleniyor...
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
        <div className="bg-red-500/20 p-3 rounded-2xl text-red-500">
          <FaHeart size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Favorilerim
          </h2>
          <p className="text-sm text-gray-500">
            {beats.length} beat favorilerinde ekli.
          </p>
        </div>
      </div>

      {beats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
          <FaMusic size={48} className="text-gray-700 mb-4" />
          <p className="text-gray-500 font-medium">
            Henüz favori bir beat eklememişsin.
          </p>
          <Link
            to="/"
            className="mt-4 text-blue-500 hover:underline font-bold text-sm"
          >
            Hemen beatleri keşfetmeye başla →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {beats.map((beat) => (
            <div
              key={beat.id}
              className={`relative bg-gray-900 border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col group ${
                playingId === beat.id
                  ? "border-blue-500 shadow-lg shadow-blue-900/20"
                  : "border-gray-800"
              }`}
            >
              <div className="w-full aspect-square relative">
                <img
                  src={
                    beat.coverUrl
                      ? `${API_BASE_URL}/${beat.coverUrl.replaceAll("\\", "/")}`
                      : placeholder
                  }
                  alt={beat.title}
                  className="w-full h-full object-cover"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(beat.id);
                  }}
                  className="absolute top-3 right-3 bg-red-600 px-2 py-1.5 rounded-xl text-white text-xs flex items-center gap-1.5 z-10 hover:bg-red-500 transition-all border border-red-400/20 shadow-lg"
                  title="Favorilerden Kaldır"
                >
                  <FaHeart />
                </button>

                <div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-[2px]"
                  onClick={() => handlePlayPause(beat)}
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:scale-110 hover:bg-white/20 transition-all duration-300 shadow-2xl">
                    {playingId === beat.id ? (
                      <FaPause className="text-xl animate-pulse" />
                    ) : (
                      <FaPlay className="text-xl ml-0.5" />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-lg font-bold truncate text-white mb-1 tracking-tight">
                    {beat.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium mb-3 flex items-center gap-2">
                    <Link
                      to={`/producer/${beat.producerId}`}
                      className="text-blue-400 hover:underline"
                    >
                      {beat.producerUsername}
                    </Link>
                    <span className="text-gray-700">•</span>
                    <span className="text-gray-300">{beat.bpm} BPM</span>
                    <span className="text-gray-700">•</span>
                    <span className="text-blue-300/80 font-bold">
                      {beat.beatKey}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(beat.genres ?? []).map((id: Key | null | undefined) => (
                      <span
                        key={id}
                        className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-lg border border-blue-500/20 font-medium capitalize"
                      >
                        {getGenreName(id)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 hover:brightness-110 transition-all border border-blue-400/20">
                    {beat.price ? `${beat.price} TL` : "Ücretsiz"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
