import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <main className="not-found-page"><span className="eyebrow">A TURN IN THE PATH</span><h1>This page<br /><em>is elsewhere.</em></h1><p>The page or piece you were looking for may have moved on.</p><Link href="/" className="button button-dark"><ArrowLeft size={15} /> BACK TO THE ATELIER</Link></main>;
}
