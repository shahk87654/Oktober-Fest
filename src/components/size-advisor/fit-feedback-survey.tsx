"use client";

import { useState } from "react";

export function FitFeedbackSurvey({ product, size }: { product: string; size: string }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return <p className="fit-feedback-thanks" role="status">Thank you. Your feedback helps us improve fit guidance.</p>;
  return (
    <fieldset className="fit-feedback-survey">
      <legend>How did your recommended size fit?</legend>
      {["Too small", "Perfect", "Too large"].map((answer) => (
        <button
          key={answer}
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("fit_feedback_submitted", { detail: { product, size, answer } }));
            setSubmitted(true);
          }}
        >{answer}</button>
      ))}
    </fieldset>
  );
}
