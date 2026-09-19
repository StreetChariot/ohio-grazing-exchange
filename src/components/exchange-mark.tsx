"use client";

import { useId } from "react";

export function ExchangeMark({ className }: { className?: string }) {
  const clipId = useId();
  const rays = 12;

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="32" cy="32" r="30" fill="#14643A" />
        {Array.from({ length: rays }, (_, index) => (
          <path
            key={index}
            d="M32 32 L28.6 4.5 H35.4 Z"
            fill={index % 2 === 0 ? "#E2B15A" : "#F6E2B5"}
            transform={`rotate(${index * (360 / rays)} 32 32)`}
          />
        ))}
        <circle cx="32" cy="32" r="15.5" fill="#FBF3DF" />
        <circle cx="32" cy="25.5" r="5.2" fill="#E2B15A" />
        <path d="M17.5 39c4.5-7 9-7.5 14.5-1 5.5 6.5 10 5.5 14.5-1.5V50H17.5Z" fill="#1F7A45" />
        <path d="M17.5 44.5c5-3.2 8.2 0.8 14.5-0.6 6.3-1.4 9-3.2 14.5 0.8V50H17.5Z" fill="#6B3A2C" />
      </g>
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="#FBF3DF" strokeWidth="1.25" />
    </svg>
  );
}
