import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page max-w-xl mx-auto px-6 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-4">
        <Sparkles size={28} />
      </div>
      <span className="eyebrow">
        <i /> A TURN IN THE ALPINE TRAIL
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl font-medium mt-3 mb-3 text-slate-900">
        This page <em>is elsewhere.</em>
      </h1>
      <p className="text-slate-500 text-base mb-8 max-w-md mx-auto">
        The piece, story, or page you were looking for may have moved to a new collection.
      </p>
      <Link href="/" className="button button-dark inline-flex items-center gap-2">
        <ArrowLeft size={16} />
        <span>RETURN TO THE ATELIER HOME</span>
      </Link>
    </main>
  );
}
