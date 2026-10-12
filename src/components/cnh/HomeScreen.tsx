import { useMyProfile } from "@/hooks/use-my-profile";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Menu, Bell, Camera, Images, Trash2, X, Mail, Landmark, Contact, Smile, Settings, BookOpen, CircleHelp, CircleAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrazilFlag, RoadSymbol } from "./Symbols";
import serproLogo from "@/assets/serpro-original.png";
import driverSymbol from "@/assets/driver-symbol.png";
import vehicleSymbol from "@/assets/vehicle-symbol.png";
import fineSymbol from "@/assets/fine-symbol.png";
import educationSymbol from "@/assets/education-symbol.png";
const serviceAssets = { driver: driverSymbol, vehicle: vehicleSymbol, fine: fineSymbol, education: educationSymbol };

const cards = [
  { title: "CONDUTOR", kind: "driver", first: <>Gerencie sua</>, second: <strong>habilitação</strong>, to: "/condutor" },
  { title: "VEÍCULOS", kind: "vehicle", first: <>Acesso ao <strong>CRLV-e,</strong></>, second: <>venda digital</>, to: "/veiculos" },
  { title: "INFRAÇÕES", kind: "fine", first: <>Visualize e pague infrações</>, second: <>com até <strong>40% de desconto</strong></>, to: "/infracoes" },
  { title: "EDUCAÇÃO", kind: "education", first: <>Conheça nossas</>, second: <strong>campanhas e projetos</strong> },
] as const;
const groups = [
  [{ icon: Mail, label: "Central de Mensagens", to: "/mensagens" }, { icon: Landmark, label: "Política de Privacidade" }, { icon: Contact, label: "Termo de Responsabilidade" }, { icon: Smile, label: "Avaliar" }],
  [{ icon: Settings, label: "Preferências" }, { icon: BookOpen, label: "Tutorial" }, { icon: CircleHelp, label: "Assistente Virtual" }, { icon: CircleAlert, label: "Sobre a CDT" }],
  [{ icon: LogOut, label: "Sair da conta" }],
];

export function HomeScreen() {
  const [drawer, setDrawer] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useMyProfile();
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }
  const [photoDialog, setPhotoDialog] = useState(false);
  const [photo, setPhoto] = useState<string>();
  const gallery = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (photoDialog) dialogRef.current?.showModal(); else dialogRef.current?.close(); }, [photoDialog]);
  useEffect(() => { if (!photo) return; return () => URL.revokeObjectURL(photo); }, [photo]);
  useEffect(() => {
    if (!drawer) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawer(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [drawer]);
  function selectPhoto(file?: File) { if (!file || !file.type.startsWith("image/")) return; setPhoto(URL.createObjectURL(file)); setPhotoDialog(false); }
  return <div className="cnh-page cnh-home">
    <header className="cnh-header cnh-home-header">
      <div className="cnh-header-left"><Button variant="toolbar" aria-label="Abrir menu" onClick={() => setDrawer(true)}><Menu /></Button><h1>CNH do Brasil</h1></div>
      <div className="cnh-header-right"><Button asChild variant="toolbar"><Link to="/mensagens" aria-label="Central de Mensagens"><Bell fill="currentColor" /></Link></Button><Button variant="profile" aria-label="Foto de Perfil" onClick={() => setPhotoDialog(true)}>{photo ? <img src={photo} alt="Perfil" /> : (profile?.full_name?.trim()[0]?.toUpperCase() ?? "")}</Button></div>
    </header>
    <main className="cnh-home-cards">{cards.map(card => {
      const contents = <><RoadSymbol kind={card.kind}/><div><h2>{card.title}</h2><p>{card.first}<br/>{card.second}</p></div><img className={`cnh-service-original cnh-service-original-${card.kind}`} src={serviceAssets[card.kind]} alt=""/></>;
      return "to" in card ? <Button asChild key={card.title} variant="tile" className={`cnh-tile-${card.kind}`}><Link to={card.to}>{contents}</Link></Button> : <Button key={card.title} variant="tile" className={`cnh-tile-${card.kind}`} aria-disabled="true">{contents}</Button>;
    })}</main>
    <footer className="cnh-footer"><img className="cnh-serpro-logo" src={serproLogo} alt="Serpro"/><div className="cnh-footer-center">CNH do <strong>BRASIL</strong></div><div className="cnh-ministry"><span>Ministério dos<br/><strong>Transportes</strong></span><BrazilFlag/></div></footer>
    {drawer && <><div className="cnh-overlay" onClick={() => setDrawer(false)}/><aside className="cnh-drawer" aria-label="Menu principal"><div className="cnh-drawer-identity"><div className="cnh-small-logo"><BrazilFlag/>CNH do<br/><strong>BRASIL</strong></div><p className="cnh-drawer-name">{profile?.full_name?.toUpperCase() ?? ""}</p><p className="cnh-drawer-cpf">{profile?.cpfMasked ?? ""}</p></div>{groups.map((group, index) => <div className="cnh-drawer-group" key={index}>{group.map(item => {
      const content = <><item.icon fill={item.icon === Mail ? "currentColor" : "none"}/><span>{item.label}</span></>;
      if ("to" in item && typeof item.to === "string") return <Button asChild variant="row" key={item.label}><Link to={item.to}>{content}</Link></Button>;
      if (item.icon === LogOut) return <Button variant="row" key={item.label} onClick={() => void handleSignOut()}>{content}</Button>;
      return <Button variant="row" key={item.label} aria-disabled="true">{content}</Button>;
    })}</div>)}</aside></>}
    <dialog ref={dialogRef} className="cnh-modal" onCancel={() => setPhotoDialog(false)} onClick={event => { if (event.target === event.currentTarget) setPhotoDialog(false); }} aria-labelledby="profile-title"><div className="cnh-modal-heading"><h2 id="profile-title">Foto de Perfil</h2><Button variant="toolbar" className="cnh-modal-close" aria-label="Fechar" onClick={() => setPhotoDialog(false)}><X/></Button></div><div className="cnh-modal-actions"><Button variant="cnh" onClick={() => camera.current?.click()}><Camera fill="currentColor"/>Tirar foto</Button><Button variant="cnh" onClick={() => gallery.current?.click()}><Images/>Escolher da galeria</Button><Button variant="cnh" onClick={() => { setPhoto(undefined); setPhotoDialog(false); }}><Trash2 fill="currentColor"/>Remover foto</Button></div></dialog>
    <input ref={gallery} type="file" accept="image/*" hidden onChange={e => selectPhoto(e.target.files?.[0])}/><input ref={camera} type="file" accept="image/*" capture="user" hidden onChange={e => selectPhoto(e.target.files?.[0])}/>
  </div>;
}