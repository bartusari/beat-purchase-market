import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { api } from "../../helper/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCloudUploadAlt, FaMusic } from "react-icons/fa";
import { toast } from "react-toastify";

export const BeatKeys = [
  "C",
  "Cm",
  "D",
  "Dm",
  "E",
  "Em",
  "F",
  "Fm",
  "G",
  "Gm",
  "A",
  "Am",
  "B",
  "Bm",
] as const;
export type BeatKey = (typeof BeatKeys)[number];

export default function UploadBeat() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState<number | "">("");
  const [beatKey, setBeatKey] = useState<BeatKey | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get("/genres");
        setGenres(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  useEffect(() => {
    if (!audioFile) {
      setAudioPreview(null);
      return;
    }
    const url = URL.createObjectURL(audioFile);
    setAudioPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!title || !beatKey || !audioFile || selectedGenres.length === 0) {
      toast.warning("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("beatKey", beatKey);
    if (bpm !== "") formData.append("bpm", bpm.toString());
    if (price !== "") formData.append("price", price.toString());
    if (coverFile) formData.append("coverUrl", coverFile);
    formData.append("audioUrl", audioFile);
    formData.append("genreIds", selectedGenres.join(","));

    try {
      setLoading(true);
      await api.post("/beats", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Beat başarıyla yüklendi!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Beat yükleme başarısız!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl overflow-hidden mb-12">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FaMusic className="text-blue-500" /> Yeni Beat Yükle
          </h2>
          <span className="text-[10px] bg-blue-600/20 text-blue-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
            Producer Modu
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Beat Adı *
            </label>
            <input
              type="text"
              placeholder="Örn: Midnight Memories"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                placeholder="140"
                value={bpm}
                onChange={(e) =>
                  setBpm(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                Nota Anahtarı *
              </label>
              <select
                value={beatKey}
                onChange={(e) => setBeatKey(e.target.value as BeatKey)}
                className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
                required
              >
                <option value="" disabled>
                  Seçiniz
                </option>
                {BeatKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Satış Fiyatı (₺)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Müzik Türleri *
            </label>
            <div className="flex flex-wrap gap-2 p-4 bg-gray-800/30 rounded-2xl border border-gray-700 max-h-48 overflow-y-auto shadow-inner">
              {genres.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() =>
                    setSelectedGenres((prev) =>
                      prev.includes(g.id)
                        ? prev.filter((id) => id !== g.id)
                        : [...prev, g.id],
                    )
                  }
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                    selectedGenres.includes(g.id)
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40"
                      : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Kapak Görseli
            </label>
            <div className="relative group bg-gray-800/30 border border-dashed border-gray-700 rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-blue-500 transition-all cursor-pointer">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Kapak"
                  className="w-24 h-24 object-cover rounded-xl shadow-2xl border border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-800 rounded-xl flex items-center justify-center text-gray-600">
                  <FaCloudUploadAlt size={32} />
                </div>
              )}
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                Görsel Seçmek İçin Tıklayın
              </span>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCoverFile(e.target.files?.[0] ?? null)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
              Audio Dosyası *
            </label>
            <div
              className={`p-4 rounded-2xl bg-gray-800/50 border border-gray-700 flex flex-col gap-4 ${
                audioFile ? "border-green-500/50" : ""
              }`}
            >
              {audioPreview && (
                <audio
                  key={audioPreview}
                  controls
                  className="w-full h-8 opacity-80"
                >
                  <source src={audioPreview} />
                </audio>
              )}
              <label
                htmlFor="audio-input"
                className="w-full py-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-600/20 transition-all"
              >
                <FaCloudUploadAlt />{" "}
                {audioFile?.name || "SES DOSYASI YÜKLE (.mp3 / .wav)"}
              </label>
              <input
                id="audio-input"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAudioFile(e.target.files?.[0] ?? null)
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-900/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            disabled={loading}
          >
            {loading ? (
              <>Yükleniyor...</>
            ) : (
              <>
                <FaPlus /> BEAT'İ YAYINLA
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
