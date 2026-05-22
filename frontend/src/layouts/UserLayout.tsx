import type { ReactNode } from "react";
import UserNavbar from "../components/navbars/UserNavbar";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <UserNavbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
