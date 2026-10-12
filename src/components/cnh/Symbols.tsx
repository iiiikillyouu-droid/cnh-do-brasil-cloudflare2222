import type { SVGProps } from "react";

export function RoadSymbol({kind}: {kind: "driver" | "vehicle" | "fine" | "education"}) {
  const paths = {
    driver: { area: "M306 -12 C265 10 383 14 350 47 C334 61 318 71 293 88 L394 88 L394 -12Z", edge: "M315 -12 C274 10 395 16 350 51 C329 69 308 80 295 88", outer: "M370 -12 C330 0 415 15 390 40 C385 55 375 70 366 74", dash: "M340 1 L350 9 M363 15 L378 23 M377 59 L388 54" },
    vehicle: { area: "M254 -10 C175 35 181 54 219 94 L394 94 L394 -10Z", edge: "M264 -10 C192 30 189 49 225 94", outer: "M358 -10 C306 35 320 57 362 94", dash: "M296 -5 L286 5 M273 27 Q268 38 270 47 M284 67 L296 80" },
    fine: { area: "M230 -10 C263 33 271 58 273 94 L394 94 L394 -10Z", edge: "M245 -10 C273 30 285 62 288 94", outer: "M322 -10 C344 20 361 49 369 71", dash: "" },
    education: { area: "M262 -10 C258 26 239 61 215 94 L394 94 L394 -10Z", edge: "M287 -10 C285 26 269 58 248 94", outer: "M378 20 C376 49 368 71 360 94", dash: "" },
  }[kind];
  return <svg className="cnh-road-art" viewBox="0 0 382 82" preserveAspectRatio="none" aria-hidden="true"><path className="cnh-road-surface" d={paths.area}/><path className="cnh-road-edge" d={paths.edge}/><path className="cnh-road-edge" d={paths.outer}/><path className="cnh-road-dashes" d={paths.dash}/></svg>;
}

export function BrazilFlag() {
  return <svg className="cnh-flag" viewBox="0 0 90 64" aria-hidden="true"><rect width="90" height="64" fill="var(--cnh-green)"/><path d="M45 6 83 32 45 58 7 32Z" fill="var(--cnh-yellow)"/><circle cx="45" cy="32" r="13" fill="var(--cnh-darkblue)"/><path d="M33 28q12-2 24 6" stroke="var(--primary-foreground)" strokeWidth="2" fill="none"/></svg>;
}

export function ServiceSymbol({ kind, ...props }: SVGProps<SVGSVGElement> & { kind: "driver" | "vehicle" | "fine" | "education" }) {
  return <svg viewBox="0 0 64 44" className="cnh-symbol" aria-hidden="true" {...props}>
    {kind === "education" ? <g fill="currentColor"><path d="M23 4h29a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H35v-4h15V8H25v7h-4V7a3 3 0 0 1 2-3Z"/><circle cx="25" cy="19" r="7"/><path d="M14 36c0-7 4-10 11-10s11 3 11 10v3H14Z"/></g> : <g fill="currentColor">
      {kind !== "vehicle" && <><circle cx="11" cy="15" r="6"/><path d="M2 31v-5c0-6 17-6 17 0v5Z"/>{kind === "fine" && <path d="m5 8 6-4 7 4-1 3H6Z"/>}</>}
      <path d="m25 9-5 12c-4 1-6 4-6 8v6h5v5h7v-5h22v5h7v-5h4v-7c0-4-2-6-6-7L48 9c-2-3-20-3-23 0Zm3 3h17l4 10H24Zm-5 15a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm27 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/>
    </g>}
  </svg>;
}