import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helper/api";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaUserTag,
  FaCamera,
  FaMusic,
  FaUserPlus,
  FaShieldAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"USER" | "PRODUCER">("USER");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Şifreler birbiriyle eşleşmiyor!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      if (photo) formData.append("profileImage", photo);

      await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Hesabınız başarıyla oluşturuldu!");
      navigate("/login");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        toast.error(errorMessage[0]);
      } else if (typeof errorMessage === "string") {
        toast.error(errorMessage);
      } else {
        toast.error(
          "Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin."
        );
      }
      console.error("Register Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 relative overflow-hidden">
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 py-6">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-900/40 mb-4 rotate-3">
            <FaMusic className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter text-center">
            BEAT PURCHASE MARKET
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-widest uppercase mt-1">
            Yeni Hesap Oluştur
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Fotoğraf Yükleme */}
            <div className="flex flex-col items-center">
              <div className="relative group w-24 h-24">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profil"
                    className="w-full h-full object-cover rounded-full border-4 border-gray-800 shadow-xl transition-all group-hover:brightness-50"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-800 shadow-xl transition-all group-hover:bg-gray-700">
                    <FaCamera className="text-gray-500 text-2xl" />
                  </div>
                )}
                <label
                  htmlFor="register-photo"
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <FaCamera className="text-white text-lg" />
                </label>
                <input
                  id="register-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-2">
                Profil Fotoğrafı
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {/* Username */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaUser className="text-blue-500 text-[10px]" /> Kullanıcı Adı
                </label>
                <input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-800/40 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaEnvelope className="text-blue-500 text-[10px]" /> Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-800/40 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaLock className="text-blue-500 text-[10px]" /> Şifre
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-800/40 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaShieldAlt className="text-blue-500 text-[10px]" />{" "}
                  Şifrenizi Tekrar Giriniz
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-4 rounded-2xl bg-gray-800/40 border transition-all outline-none ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  } text-white`}
                  required
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FaUserTag className="text-blue-500 text-[10px]" /> Rol Seçimi
                </label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "USER" | "PRODUCER")
                  }
                  className="w-full p-4 rounded-2xl bg-gray-800/40 border border-gray-700 text-white focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="USER" className="bg-gray-900">
                    USER (Dinleyici)
                  </option>
                  <option value="PRODUCER" className="bg-gray-900">
                    PRODUCER (Üretici)
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-3 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FaUserPlus /> Kayıt Ol
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Zaten bir hesabın var mı?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-400 font-bold hover:underline"
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
