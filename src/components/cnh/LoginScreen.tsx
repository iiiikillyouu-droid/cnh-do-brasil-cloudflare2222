import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import hero from "@/assets/login-hero.jpg";
import { BrazilFlag } from "./Symbols";

export function LoginScreen() {
  return <main className="cnh-login">
    <img className="cnh-login-hero" src={hero} alt="Motorista sorrindo ao volante" width={1536} height={640}/>
    <section className="cnh-login-panel">
      <div className="cnh-login-logo"><BrazilFlag/><span className="cnh-login-cnh">CNH do</span><span className="cnh-login-brasil">BRASIL</span></div>
      <div className="cnh-login-terms"><p>Ao entrar, você concorda com nosso</p><a href="https://www.gov.br/transportes/pt-br/assuntos/transito">Termo de Responsabilidade</a><p>e <a href="https://www.gov.br/serpro/pt-br/lgpd">Política de Privacidade</a></p></div>
      <Button asChild variant="cnh" className="cnh-login-button"><Link to="/govbr">ENTRAR COM GOV.br</Link></Button>
    </section>
  </main>;
}