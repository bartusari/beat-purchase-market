import { useState, useEffect } from "react";
import { useAudio } from "../context/AudioContext";
import { getBeats, toggleFavorite, getGenre } from "../helper/api";
import type { Beat } from "../types/beat";
import placeholder from "../assets/placeholder.png";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart, FaPause, FaPlay } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Home() {
  const [beats, setBeats] = useState<
    Array<Beat & { favoriteCount: number; isFavorite: boolean }>
  >([]);
  const [genresMap, setGenresMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { audioRef, playingId, setPlayingId } = useAudio();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBeats();
        setBeats(
          data.map((b) => ({
            ...b,
            genres: b.genres ?? [],
            favoriteCount: b.favoriteCount ?? 0,
            isFavorite: Boolean(b.isFavorite),
          })),
        );
      } catch (err) {
        console.error("Beat fetch failed:", err);
        setError("Beatler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const getGenreName = (id: number) => genresMap.get(id) ?? `Genre ${id}`;

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

      if (isAdding) {
        toast.success(`${targetBeat.title} favorilere eklendi!`, {
          icon: (
            <span role="img" aria-label="heart">
              ❤️
            </span>
          ),
          position: "top-right",
        });
      } else {
        toast.info(`${targetBeat.title} favorilerden kaldırıldı.`, {
          position: "top-right",
        });
      }
    } catch (err) {
      setBeats((prev) =>
        prev.map((b) =>
          b.id === beatId
            ? {
                ...b,
                isFavorite: !b.isFavorite,
                favoriteCount: b.isFavorite
                  ? b.favoriteCount + 1
                  : Math.max(0, b.favoriteCount - 1),
              }
            : b,
        ),
      );
      toast.error("Favori işlemi başarısız oldu.");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-white text-center italic">
        Beatler yükleniyor…
      </div>
    );
  if (error) return <p className="p-8 text-red-500 text-center">{error}</p>;

  const displayedBeats = selectedGenre
    ? beats.filter((b) => (b.genres ?? []).includes(selectedGenre))
    : beats;

  const uniqueGenreIds = Array.from(
    new Set(beats.flatMap((b) => b.genres ?? [])),
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 border-b border-gray-800 pb-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Keşfet!
        </h2>
        <p className="text-sm text-gray-500">
          En yeni beatleri keşfet ve projene güç kat.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {uniqueGenreIds.map((genreId) => (
          <button
            key={genreId}
            onClick={() =>
              setSelectedGenre(selectedGenre === genreId ? null : genreId)
            }
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
              selectedGenre === genreId
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40 scale-105"
                : "bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-200"
            }`}
          >
            {getGenreName(genreId)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedBeats.map((beat) => (
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
                  handleFavorite(beat.id);
                }}
                className={`absolute top-3 right-3 px-2.5 py-1.5 rounded-xl text-white text-xs flex items-center gap-2 z-10 transition-all border shadow-lg ${
                  beat.isFavorite
                    ? "bg-red-600 border-red-400/20 hover:bg-red-500"
                    : "bg-black/60 backdrop-blur-md border-white/10 hover:bg-black/80"
                }`}
                title={
                  beat.isFavorite ? "Favorilerden Kaldır" : "Favorilere Ekle"
                }
              >
                <FaHeart
                  className={beat.isFavorite ? "text-white" : "text-white/40"}
                />
                <span className="font-bold tracking-tighter">
                  {beat.favoriteCount}
                </span>
              </button>

              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white"
                onClick={() => handlePlayPause(beat)}
              >
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:scale-110 hover:bg-white/20 transition-all duration-300 shadow-2xl">
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
                  {(beat.genres ?? []).map((id) => (
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
    </div>
  );
}
