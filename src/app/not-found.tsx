import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <section className="page-shell not-found"><p className="eyebrow">Well, that wandered off</p><h1 className="display">This page took the scenic route.</h1><p>The page you&apos;re looking for isn&apos;t here. Let&apos;s get you back to the good part.</p><Link className="button-primary" href="/"><ArrowLeft size={16} /> Return to the atelier</Link><style>{`
    .not-found { display:flex; min-height:65vh; align-items:flex-start; justify-content:center; flex-direction:column; }.not-found .eyebrow { color:var(--pretzel); }.not-found h1 { max-width:850px; margin:.7rem 0; font-size:clamp(3rem,8vw,7rem); line-height:.95; }.not-found p:not(.eyebrow) { max-width:520px; color:var(--muted); line-height:1.6; }
  `}</style></section>;
}
