import type { ReactNode } from "react";
import ProducerNavbar from "../components/navbars/ProducerNavbar";

interface ProducerLayoutProps {
  children: ReactNode;
}

export default function ProducerLayout({ children }: ProducerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <ProducerNavbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
