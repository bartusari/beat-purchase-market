import { useState, useEffect } from "react";
import { getMe, changePassword, api } from "../../helper/api";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/user";
import avatar from "../../assets/avatar.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaUser,
  FaLock,
  FaEnvelope,
  FaIdBadge,
  FaTrashAlt,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Profile() {
  const { accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [passwordForDelete, setPasswordForDelete] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!accessToken) return;
      try {
        const data = await getMe(accessToken);
        setUser(data);
        setUsername(data.username);
      } catch (err) {
        setError("Kullanıcı bilgisi alınamadı");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [accessToken]);

  useEffect(() => {
    if (!profileImage) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accessToken) return;

    if (!passwordForDelete) {
      toast.warning("Lütfen onaylamak için şifrenizi girin.");
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete(`/users/${user.id}`, {
        data: { password: passwordForDelete },
      });

      toast.success("Hesabınız başarıyla silindi.");
      logout();
      navigate("/");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Hesap silinemedi. Lütfen tekrar deneyin.";
      toast.error(errorMessage);
      console.error("Silme Hatası:", err);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setPasswordForDelete("");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accessToken) return;

    setUpdateLoading(true);
    const formData = new FormData();
    formData.append("username", username);
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      await api.patch(`/users/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profil başarıyla güncellendi!");
      const updatedUser = await getMe(accessToken);
      setUser(updatedUser);
      setProfileImage(null);
    } catch (err) {
      toast.error("Profil güncelleme başarısız!");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning("Lütfen tüm alanları doldurun");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Yeni şifre ve şifre tekrarı aynı olmalı");
      return;
    }

    try {
      await changePassword(accessToken, { oldPassword, newPassword });
      toast.success("Şifre başarıyla değiştirildi!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Şifre değiştirilemedi!";
      if (Array.isArray(errorMessage)) {
        toast.error(errorMessage[0]);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-12 text-white italic">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-red-500 text-center font-bold">{error}</div>
    );
  if (!user)
    return (
      <div className="p-8 text-white text-center">Kullanıcı bulunamadı.</div>
    );

  const displayedImage =
    preview ??
    (user.profileImage
      ? `${API_BASE_URL}/${user.profileImage.replaceAll("\\", "/")}`
      : avatar);

  return (
    <div className="max-w-2xl mx-auto p-8 flex flex-col gap-10">
      <section className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-6">
          <div className="bg-blue-600/20 p-3 rounded-2xl text-blue-500">
            <FaUser size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Profil Ayarları
          </h2>
        </div>

        <form
          onSubmit={handleProfileUpdate}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative group w-32 h-32">
              <img
                src={displayedImage}
                alt="Profil"
                className="w-full h-full object-cover rounded-full border-4 border-gray-800 shadow-xl transition-all group-hover:brightness-50"
              />
              <label
                htmlFor="profile-image-input"
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <FaCamera className="text-white text-2xl" />
              </label>
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setProfileImage(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
              Fotoğrafı Değiştir
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2 tracking-widest">
                <FaIdBadge className="text-blue-500" /> Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 flex items-center gap-2 tracking-widest">
                <FaEnvelope className="text-blue-500" /> Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={updateLoading}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {updateLoading ? "Güncelleniyor..." : "Profili Kaydet"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-6">
          <div className="bg-yellow-600/20 p-3 rounded-2xl text-yellow-500">
            <FaLock size={20} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Şifre Değiştir
          </h2>
        </div>
        <form
          onSubmit={handlePasswordChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Mevcut Şifre
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:border-yellow-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Yeni Şifre
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:border-yellow-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">
              Şifre Tekrar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:border-yellow-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="md:col-span-2 mt-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-900/20"
          >
            Şifreyi Güncelle
          </button>
        </form>
      </section>

      <section className="bg-red-950/20 border border-red-900/50 p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex items-center gap-6 mb-6">
          <div className="bg-red-600/20 p-3 rounded-2xl text-red-500">
            <FaExclamationTriangle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Tehlikeli Bölge
            </h2>
            <p className="text-red-500/60 text-xs font-medium uppercase tracking-tighter">
              Bu işlem geri alınamaz
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-red-950/30 border border-red-900/30">
          <div className="text-center md:text-left">
            <p className="text-gray-300 font-semibold">
              Hesabımı Kalıcı Olarak Sil
            </p>
            <p className="text-gray-500 text-sm">
              Tüm verileriniz silinecektir.
            </p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-900/40 group"
          >
            <FaTrashAlt className="group-hover:animate-bounce" />
            Hesabımı Sil
          </button>
        </div>
      </section>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsDeleteModalOpen(false)}
          ></div>

          <div className="relative bg-[#0f0f12] border border-gray-800 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 z-10">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-red-600/20 p-4 rounded-3xl text-red-500 mb-4 rotate-3">
                <FaExclamationTriangle size={30} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Emin misiniz?
              </h3>
              <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                Hesabınızı kalıcı olarak silmek üzeresiniz. Lütfen onaylamak
                için mevcut şifrenizi girin.
              </p>
            </div>

            <form
              onSubmit={handleDeleteAccount}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Şifre
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm" />
                  <input
                    autoFocus
                    type="password"
                    placeholder="••••••••"
                    value={passwordForDelete}
                    onChange={(e) => setPasswordForDelete(e.target.value)}
                    className="w-full pl-11 p-4 rounded-2xl bg-gray-800/40 border border-gray-700 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-2xl transition-all"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Onayla ve Sil"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
