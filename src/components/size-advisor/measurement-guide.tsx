"use client";

import Image from "next/image";

export function MeasurementGuide({ measurement, gender }: { measurement: string; gender: "women" | "men" }) {
  const image = ({
    arm_length: "sleeve",
    upper_arm: "sleeve",
    sleeve_length: "sleeve",
    high_hip: "hip",
    rise: "outseam",
    thigh: "hip",
  } as Record<string, string>)[measurement] ?? measurement.replaceAll("_", "-");
  return (
    <figure className="measurement-guide">
      <Image
        src={`/size-guide/${image}.svg`}
        alt={`Illustration showing how to measure ${measurement.replaceAll("_", " ")}`}
        width={88}
        height={88}
        loading="lazy"
      />
      <figcaption>Keep the tape level and snug, not tight.</figcaption>
      <span className="sr-only">{gender === "women" ? "Women's" : "Men's"} measurement guide</span>
    </figure>
  );
}
