import { useState, useEffect } from "react";
import { getBeats, api } from "../../helper/api";
import { useAuth } from "../../context/AuthContext";
import type { Beat } from "../../types/beat";
import { FaMusic, FaHeart, FaCloudUploadAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import placeholder from "../../assets/placeholder.png";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Dashboard() {
  const { accessToken, logout } = useAuth();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchDashboardData = async () => {
      try {
        const meRes = await api.get("/users/me");
        const meData = meRes.data;
        setMyId(meData.id);

        const allBeats = await getBeats();
        const myBeats = allBeats.filter((b) => b.producerId === meData.id);
        setBeats(myBeats);
      } catch (err) {
        console.error("Dashboard verisi yüklenemedi:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [accessToken, logout]);

  const totalBeats = beats.length;
  const totalFavorites = beats.reduce(
    (sum, b) => sum + (b.favoriteCount ?? 0),
    0,
  );

  if (loading)
    return (
      <div className="p-8 text-white italic text-center">
        Panel yükleniyor...
      </div>
    );

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex justify-between items-end border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">
            DASHBOARD
          </h2>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-1">
            Producer Performansın
          </p>
        </div>
        <Link
          to="/upload"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2"
        >
          <FaCloudUploadAlt size={20} /> Yeni Beat Yükle
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] shadow-xl flex items-center gap-6">
          <div className="bg-blue-600/20 p-5 rounded-2xl text-blue-500">
            <FaMusic size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Toplam Beat
            </p>
            <h3 className="text-4xl font-black text-white">{totalBeats}</h3>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-[2rem] shadow-xl flex items-center gap-6">
          <div className="bg-red-600/20 p-5 rounded-2xl text-red-500">
            <FaHeart size={32} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Toplam Beğeni
            </p>
            <h3 className="text-4xl font-black text-white">{totalFavorites}</h3>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            Son Yüklediğin Beatler
          </h3>
          <Link
            to={`/producer/${myId}`}
            className="text-blue-500 text-sm font-bold hover:underline"
          >
            Hepsini Gör →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/30 text-gray-500 text-[10px] uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Beat</th>
                <th className="px-8 py-4 text-center">BPM / Key</th>
                <th className="px-8 py-4 text-center">Beğeni</th>
                <th className="px-8 py-4 text-right">Fiyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {beats.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-12 text-center text-gray-500 italic"
                  >
                    Henüz hiç beat yüklememişsin.
                  </td>
                </tr>
              ) : (
                beats.slice(0, 10).map((beat) => (
                  <tr
                    key={beat.id}
                    className="hover:bg-gray-800/20 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            beat.coverUrl
                              ? `${API_BASE_URL}/${beat.coverUrl.replaceAll(
                                  "\\",
                                  "/",
                                )}`
                              : placeholder
                          }
                          className="w-12 h-12 rounded-lg object-cover border border-gray-700"
                          alt={beat.title}
                        />
                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {beat.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center text-gray-400 text-sm">
                      {beat.bpm} BPM • {beat.beatKey}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-red-500">
                        <FaHeart size={12} />
                        <span className="font-bold">{beat.favoriteCount}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-white">
                      {beat.price ? `${beat.price} TL` : "Ücretsiz"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
