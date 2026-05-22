import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaUser,
  FaMusic,
  FaSignOutAlt,
  FaChartPie,
  FaCloudUploadAlt,
  FaHeart,
} from "react-icons/fa";

export default function ProducerNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <nav className="sticky top-0 z-[100] bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Bölümü */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <FaMusic className="text-white text-xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter leading-none">
              BEAT PURCHASE MARKET
            </span>
            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em]">
              Producer Panel
            </span>
          </div>
        </Link>

        {/* Linkler Bölümü */}
        <div className="flex items-center gap-1 font-semibold text-sm">
          <NavLink to="/" className={navLinkStyles} end>
            <FaHome size={18} />
            <span className="hidden lg:inline">Keşfet</span>
          </NavLink>

          <NavLink to="/dashboard" className={navLinkStyles}>
            <FaChartPie size={16} />
            <span className="hidden lg:inline">Dashboard</span>
          </NavLink>

          <NavLink to="/upload" className={navLinkStyles}>
            <FaCloudUploadAlt size={18} />
            <span className="hidden lg:inline">Beat Yükle</span>
          </NavLink>

          <NavLink to="/favorites" className={navLinkStyles}>
            <FaHeart size={16} />
            <span className="hidden lg:inline">Favorilerim</span>
          </NavLink>

          <NavLink to="/profile" className={navLinkStyles}>
            <FaUser size={16} />
            <span className="hidden lg:inline">Profil</span>
          </NavLink>

          {/* Ayırıcı */}
          <div className="h-6 w-[1px] bg-gray-800 mx-3 hidden md:block" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-300 font-bold"
          >
            <FaSignOutAlt size={18} />
            <span className="hidden md:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
