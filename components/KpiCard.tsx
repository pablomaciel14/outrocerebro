import React from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "blue" | "green" | "amber";
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: KpiCardProps) {
  const variantStyles = {
    default: "text-[#4B5563] bg-[#F3F4F6] border-[#E5E7EB]",
    blue: "text-[#2563EB] bg-[#DBEAFE] border-[#BFDBFE]",
    green: "text-[#166534] bg-[#DCFCE7] border-[#BBF7D0]",
    amber: "text-[#854D0E] bg-[#FEF9C3] border-[#FEF08A]",
  };

  const formattedValue =
    typeof value === "number" ? value.toLocaleString("pt-BR") : value;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl relative overflow-hidden group hover:border-[#D1D5DB] transition-all shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
          {title}
        </p>
        <div className={`p-2.5 rounded-xl border ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-[#1F2937] mt-3 tracking-tight">{formattedValue}</p>
      {subtitle && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-[#6B7280] font-medium">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
