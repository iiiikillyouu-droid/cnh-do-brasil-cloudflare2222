import { useMyProfile } from "@/hooks/use-my-profile";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IdCard, BookUser, UserRoundCheck, CircleParking } from "lucide-react";
import { TopBar } from "@/components/cnh/TopBar";
import { Button } from "@/components/ui/button";
import { cnhHead } from "@/lib/cnh-meta";
export const Route = createFileRoute("/condutor")({ head: () => cnhHead("Condutor", "Informações do condutor e serviços para CNH."), component: Condutor });
function maskName(name: string) { return name.trim().toUpperCase().split(/\s+/).filter(Boolean).map(w => w[0] + "*".repeat(w.length - 1)).join(" "); }
function maskCpfPartial(cpf: string) { const d = cpf.replace(/\D/g, ""); return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : ""; }
function Condutor() {
 const { data: p } = useMyProfile();
 return <div className="cnh-page"><TopBar title="CONDUTOR"/><section className="cnh-information"><h2>Informações do Condutor</h2><dl className="cnh-info-grid"><div style={{ gridColumn: "1 / -1" }}><dt>Nome</dt><dd>{p?.full_name ? maskName(p.full_name) : "—"}</dd></div><div><dt>CPF</dt><dd>{p?.cpf ? maskCpfPartial(p.cpf) : "—"}</dd></div><div><dt>Sexo</dt><dd>{p?.sexo === "M" ? "MASCULINO" : p?.sexo === "F" ? "FEMININO" : "—"}</dd></div><div><dt>Categoria</dt><dd>{p?.category || "—"}</dd></div><div><dt>UF de Emissão</dt><dd>{p?.uf || "—"}</dd></div><div><dt>Data de Validade</dt><dd>{p?.validade || "—"}</dd></div><div><dt>Data de Emissão</dt><dd>{p?.emissao || "—"}</dd></div></dl></section><div className="cnh-services-grid"><Button asChild variant="row" className="cnh-service"><Link to="/habilitacao"><IdCard/><span>CNH</span></Link></Button><Button asChild variant="row" className="cnh-service"><Link to="/servicos"><BookUser/><span>SERVIÇOS PARA CNH</span></Link></Button><Button variant="row" className="cnh-service" aria-disabled="true"><UserRoundCheck/><span>CADASTRO POSITIVO</span></Button><Button variant="row" className="cnh-service" aria-disabled="true"><CircleParking/><span>CREDENCIAL DE ESTACIONAMENTO</span></Button></div></div>;
}