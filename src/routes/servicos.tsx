import { useMyProfile } from "@/hooks/use-my-profile";
import { createFileRoute } from "@tanstack/react-router";
import { Microscope, UsersRound } from "lucide-react";
import { TopBar } from "@/components/cnh/TopBar";
import { Button } from "@/components/ui/button";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/servicos")({ head: () => cnhHead("Serviços para CNH", "Informações da habilitação e serviços para o condutor."), component: Services });
function Services() { const { data: p } = useMyProfile(); return <div className="cnh-page"><TopBar title="CONDUTOR" subtitle="Serviços para CNH" backTo="/condutor"/><section className="cnh-information"><h2>Informações da Habilitação</h2><dl className="cnh-info-grid"><div><dt>Categoria</dt><dd>{p?.category || "—"}</dd></div><div><dt>UF de Emissão</dt><dd>{p?.uf || "—"}</dd></div><div><dt>Data de Validade</dt><dd>{p?.validade || "—"}</dd></div><div><dt>Data de Emissão</dt><dd>{p?.emissao || "—"}</dd></div></dl></section><div className="cnh-services-grid"><Button variant="row" className="cnh-service" aria-disabled="true"><UsersRound/><span>ALTERAÇÃO DE<br/>CATEGORIA</span></Button><Button variant="row" className="cnh-service" aria-disabled="true"><Microscope/><span>EXAMES<br/>TOXICOLÓGICOS</span></Button></div></div>; }