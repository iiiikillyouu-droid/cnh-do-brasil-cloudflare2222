import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar({ title, subtitle, backTo = "/home" }: { title: string; subtitle?: string; backTo?: string }) {
  return <header className="cnh-header"><Button asChild variant="toolbar" className="cnh-back"><Link to={backTo} aria-label="Voltar"><ChevronLeft /></Link></Button><div><h1 className="cnh-header-title">{title}</h1>{subtitle && <p className="cnh-header-subtitle">{subtitle}</p>}</div></header>;
}