"use client";

import type { SizeRecommendation } from "@/lib/size-types";

export function SizeResultCard({
  result,
  onSelect,
}: {
  result: SizeRecommendation;
  onSelect: () => void;
}) {
  return (
    <section className="size-result-card" aria-live="polite">
      <span className="size-result-kicker">{result.modeLabel} recommendation · {result.confidence} confidence</span>
      <div className="size-result-main">
        <span className="size-result-size">{result.recommendedSize}</span>
        <span className="size-confidence">{result.confidence}</span>
      </div>
      {result.betweenSizes && (
        <p className="size-alternative">Between sizes: {result.recommendedSize} and {result.betweenSizes}. {result.fitNote}</p>
      )}
      {!result.betweenSizes && <p className="size-alternative">{result.fitNote}</p>}
      {result.bodiceSize && result.skirtSize && result.bodiceSize !== result.skirtSize && (
        <p className="size-alternative">Dirndl fit: bodice {result.bodiceSize} · skirt {result.skirtSize}</p>
      )}
      {result.cupEstimate && <p className="size-alternative">Bust-to-underbust difference: {result.cupEstimate} cm.</p>}
      {result.waistHipRatio && <p className="size-alternative">Waist-to-hip ratio: {result.waistHipRatio.toFixed(2)}.</p>}
      {result.bodyShape && <p className="size-alternative">Fit shape: {result.bodyShape}.</p>}
      {result.fixedBodiceWarning && <p className="advisor-warning">{result.fixedBodiceWarning}</p>}
      {result.variantMappingWarning && <p className="advisor-warning">{result.variantMappingWarning}</p>}
      <p>{result.explanation}</p>
      <button type="button" className="advisor-primary-button" onClick={onSelect} disabled={Boolean(result.variantMappingWarning)}>Select size {result.recommendedSize}</button>
    </section>
  );
}
