"use client";

import Image from "next/image";
import type { BodyShape, Gender } from "@/lib/size-types";

const womenShapes: Array<{ value: BodyShape; label: string }> = [
  { value: "hourglass", label: "Hourglass" },
  { value: "pear", label: "Pear" },
  { value: "apple", label: "Apple" },
  { value: "rectangle", label: "Rectangle" },
  { value: "inverted-triangle", label: "Inverted triangle" },
];
const menShapes = [
  { value: "athletic", label: "Athletic" },
  { value: "rectangle-m", label: "Rectangle" },
  { value: "broad", label: "Broad" },
  { value: "round", label: "Round" },
];

export function BodyShapePicker({
  gender,
  value,
  onChange,
}: {
  gender: Gender;
  value: string;
  onChange: (value: string) => void;
}) {
  const shapes = gender === "women" ? womenShapes : menShapes;
  return (
    <div className="body-shape-picker" role="group" aria-label="Choose your body shape">
      {shapes.map((shape) => (
        <button
          key={shape.value}
          type="button"
          className={value === shape.value ? "is-selected" : ""}
          onClick={() => onChange(shape.value)}
          aria-pressed={value === shape.value}
        >
          <Image src={`/size-guide/${shape.value}.svg`} alt="" width={48} height={64} loading="lazy" />
          <span>{shape.label}</span>
        </button>
      ))}
    </div>
  );
}
