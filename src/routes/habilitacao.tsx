import { useMyProfile } from "@/hooks/use-my-profile";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { loadMyCnhDocuments } from "@/lib/cnh-documents.functions";
import { maskCpf } from "@/lib/account-validation";
import { IdCard, FileOutput, Trash2, Copy } from "lucide-react";
import { TopBar } from "@/components/cnh/TopBar";
import { Button } from "@/components/ui/button";
import { cnhHead } from "@/lib/cnh-meta";
import useEmblaCarousel from "embla-carousel-react";

export const Route = createFileRoute("/habilitacao")({
  head: () => cnhHead("Habilitação", "Visualização de referência da habilitação digital."),
  component: License,
});

const defaultFields = [
  ["2 e 1. NOME E SOBRENOME", "ENZO MARTINS DE OLIVEIRA", true],
  ["3. DATA, LOCAL E UF DE NASCIMENTO", "06/02/2008, ARACAJU, SE", true],
  ["4a. DATA EMISSÃO", "17/09/2026"],
  ["4b. VALIDADE", "17/09/2027"],
  ["4c. DOC. IDENTIDADE / ÓRG EMISSOR / UF", "5482910 SSP TO", true],
  ["4d. CPF", "298.856.811-16"],
  ["5. Nº REGISTRO", "07547095802"],
  ["8. NACIONALIDADE", "BRASILEIRO(A)"],
  ["9. CAT. HAB.", "B"],
  ["6. FILIAÇÃO", "JOSE CARLOS DE OLIVEIRA", true],
  ["", "MARIA APARECIDA MARTINS DE OLIVEIRA", true],
];

function License() {
  const [page, setPage] = useState(0);
  const [removed, setRemoved] = useState(false);
  const [notice, setNotice] = useState("");
  const [userIdParam, setUserIdParam] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlId = new URLSearchParams(window.location.search).get("userId");
      const storageId = localStorage.getItem("cnh_active_user_id");
      setUserIdParam(urlId || storageId || undefined);
    }
  }, []);

  const { data: profile } = useMyProfile();
  const loadDocs = useServerFn(loadMyCnhDocuments);
  const { data: docs, isLoading } = useQuery({
    queryKey: ["my-cnh-documents", userIdParam],
    queryFn: () => loadDocs({ data: userIdParam ? { userId: userIdParam } : {} }),
    retry: 1,
  });

  const images: (string | null)[] = docs?.map((d) => d.url) ?? [];
  const docProfile = docs?.[0]?.profile;
  const activeProfile = profile?.full_name ? profile : docProfile;

  const shown = defaultFields.map(([label, value, wide]) => {
    const l = String(label);
    return [
      label,
      l.includes("NOME")
        ? (activeProfile?.full_name?.toUpperCase() || value)
        : l.includes("CPF")
          ? (activeProfile?.cpf ? maskCpf(activeProfile.cpf) : value)
          : l.includes("CAT.")
            ? (activeProfile?.category || value)
            : value,
      wide,
    ] as const;
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 25,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const current = emblaApi.selectedScrollSnap();
    setPage(current);
    setNotice(current === 0 || images[current] ? "" : "Somente a frente do documento foi fornecida como referência.");
  }, [emblaApi, images]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, images]);

  const goToPage = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
    setPage(index);
    setNotice(index === 0 || images[index] ? "" : "Somente a frente do documento foi fornecida como referência.");
  };

  return (
    <div className="cnh-page cnh-license-page">
      <TopBar title="HABILITAÇÃO" subtitle="Atualizado em 11/10/2026 - 01:31:21" backTo="/condutor" />
      <p className="cnh-authenticity">
        Verifique autenticidade do QR Code com o app{" "}
        <a href="https://www.serpro.gov.br" target="_blank" rel="noreferrer">
          Vio
        </a>
      </p>
      {!removed && (
        <>
          <div className="cnh-document-frame" ref={emblaRef}>
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center bg-muted/30 text-muted-foreground text-xs animate-pulse">
                Carregando documento…
              </div>
            ) : (
              <div className="cnh-document-slider">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="cnh-document-slide">
                    {images[index] ? (
                      <img
                        className="cnh-document-image"
                        src={images[index] ?? undefined}
                        alt={docs?.[index]?.photoName || `Página ${index + 1} do documento`}
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground bg-muted/10">
                        {index === 0
                          ? "Nenhuma foto de frente cadastrada"
                          : `Página ${index + 1} não cadastrada`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="cnh-document-dots">
            {[0, 1, 2, 3].map((index) => (
              <Button
                variant="toolbar"
                key={index}
                className="cnh-document-dot"
                aria-label={`Página ${index + 1}`}
                aria-pressed={page === index}
                onClick={() => goToPage(index)}
              />
            ))}
          </div>
        </>
      )}
      <div className="cnh-document-actions">
        <Button asChild variant="row" className="cnh-document-action">
          <Link to="/historico">
            <IdCard fill="currentColor" />
            Histórico de emissões da CNH
          </Link>
        </Button>
        <Button asChild variant="row" className="cnh-document-action">
          <Link to="/exportar">
            <FileOutput />
            Exportar
          </Link>
        </Button>
        <Button
          variant="row"
          className="cnh-document-action"
          onClick={() => {
            setRemoved(true);
            setNotice("Documento removido desta visualização.");
          }}
        >
          <Trash2 />
          Remover
        </Button>
        <Button
          variant="row"
          className="cnh-document-action"
          onClick={() => setNotice("Não há QR Code verificável nesta reprodução.")}
        >
          <Copy />
          Copiar QR Code
        </Button>
      </div>
      {docs?.[page]?.note && <p className="cnh-status">{docs[page].note}</p>}
      {notice && (
        <p role="status" className="cnh-status">
          {notice}
        </p>
      )}
    </div>
  );
}
