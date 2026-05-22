import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helper/api";
import { useAuth } from "../../context/AuthContext";
import { FaUser, FaLock, FaSignInAlt, FaMusic } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      const { accessToken, role } = res.data;

      login(role, accessToken);
      toast.success("Başarıyla giriş yapıldı! Hoş geldiniz.");
      navigate("/");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Giriş başarısız. Bilgilerinizi kontrol edin.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-900/40 mb-4 rotate-3">
            <FaMusic className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            BEAT PURCHASE MARKET
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-widest uppercase mt-1">
            Giriş Yap
          </p>
        </div>

        {/* Form Kartı */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-[2rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FaUser className="text-blue-500" /> Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-800/40 border border-gray-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <FaLock className="text-blue-500" /> Şifre
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-800/40 border border-gray-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none placeholder:text-gray-600"
                  required
                />
              </div>
            </div>

            {/* Kaydet */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-3 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FaSignInAlt /> Giriş Yap
                </>
              )}
            </button>
          </form>

          {/* Alt Linkler */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-gray-400 text-sm">
              Hesabın yok mu?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-400 font-bold hover:underline"
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
