import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Our story", description: "A modern point of view on Bavarian tradition and Alpine dress." };

export default function AboutPage() {
  return <main className="about-page">
    <header className="about-heading"><span className="eyebrow">ALPINE ATELIER / OUR POINT OF VIEW</span><h1>Rooted in<br />heritage.<br /><em>Made for today.</em></h1><p>We look to Bavarian traditions not as something to preserve behind glass, but as a living language—one that changes with the people who wear it.</p></header>
    <div className="about-image"><Image src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=85" alt="The quiet detail of a considered wardrobe" fill sizes="100vw" priority /></div>
    <section className="about-values"><div><span className="eyebrow">A LIVING HERITAGE</span><h2>Tradition is not a<br /><em>place to stand still.</em></h2></div><div><p>It is a way of seeing: the patience of a well-made detail, the character of a familiar silhouette, the quiet confidence of dressing for a moment that matters.</p><p>Alpine Atelier brings that spirit into the present. Our point of view is shaped by the cultural richness of Bavarian dress and a modern European sensibility—considered, personal and made to be worn.</p><Link className="text-link" href="/collections">EXPLORE THE COLLECTION <ArrowRight size={14} /></Link></div></section>
  </main>;
}
