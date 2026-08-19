import React from "react";
import { requirePersonalUser } from "../personal-auth";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePersonalUser();

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-[#131822] antialiased font-sans">
      {/* 1. Sidebar Fixa com Categorização Cognitiva */}
      <Sidebar displayName={user.displayName} email={user.email} />

      {/* 2. Área Principal com Trilha Cognitiva (Breadcrumbs) no Topo */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Conteúdo da Página */}
        <main className="flex-1 p-6 sm:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
