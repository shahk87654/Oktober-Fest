import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Heritage Story",
  description: "A contemporary perspective on Bavarian craftsmanship, Alpine heritage, and festive dress.",
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <header className="about-heading max-w-3xl">
        <span className="eyebrow">
          <i /> ALPINE ATELIER • OUR HERITAGE
        </span>
        <h1>
          Rooted in heritage.<br />
          <em>Refined for today.</em>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed mt-4">
          We approach Bavarian tradition not as a costume to be preserved under museum glass, but as a vibrant, living language—one that evolves with every individual who wears it to celebrate life.
        </p>
      </header>

      <div className="about-image">
        <Image
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2000&q=85"
          alt="Artisans preparing trachten fabrics in the Alpine Atelier"
          fill
          sizes="100vw"
          priority
        />
      </div>

      <section className="about-values">
        <div>
          <span className="eyebrow">
            <i /> A LIVING TRADITION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium mt-3 text-slate-900">
            Craftsmanship is not a place to <em>stand still.</em>
          </h2>
        </div>
        <div>
          <p>
            It is a standard of patient dedication: the unhurried tanning of genuine Alpine deerskin, the quiet pride in hand-cast horn buttons, and the confident poise that comes from wearing garments tailored to endure.
          </p>
          <p>
            Alpine Atelier unites that historical craftsmanship with contemporary silhouettes. From the bustling festive tents of Munich to countryside weddings and jubilee gatherings, our garments are made to be cherished, worn, and passed on.
          </p>
          <div className="pt-2">
            <Link className="button button-dark" href="/collections">
              <span>EXPLORE THE ATELIER COLLECTIONS</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
