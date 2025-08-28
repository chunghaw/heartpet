import * as React from "react";

type Props = React.SVGAttributes<SVGSVGElement> & {
  variant?: "solid" | "outline";
  title?: string;
};

export default function HeartPetLogo({
  variant = "solid",
  title = "HeartPet",
  className,
  ...rest
}: Props) {
  if (variant === "outline") {
    return (
      <svg
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
        className={className}
        {...rest}
      >
        <title>{title}</title>
        <g
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* Heart outline */}
          <path d="M176.4,30c-17.5,0-32.7,8.6-48.4,27.1C112.3,38.6,97.1,30,79.6,30
          C49.6,30,26,53.6,26,83.6c0,21.2,11.1,39.5,28.3,58.1c16,17.2,37.2,33.7,56.2,49.7
          c7.1,5.9,13.2,11,18.5,15.8c5.3-4.8,11.4-9.9,18.5-15.8c19-16,40.2-32.5,56.2-49.7
          C218.9,123.1,230,104.8,230,83.6C230,53.6,206.4,30,176.4,30z" />
          {/* Sprout */}
          <path d="M128 198v-44" />
          <path d="M128 154c25-5 40-9 51-17 12-9 19-22 22-39-20-7-37-6-47 4-10 10-12 22-12 36z" />
          <path d="M128 154c-25-5-40-9-51-17-12-9-19-22-22-39 20-7 37-6 47 4 10 10 12 22 12 36z" />
        </g>
      </svg>
    );
  }

  // SOLID: heart with sprout cutout (mask)
  return (
    <svg
      viewBox="0 0 256 256"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      {...rest}
    >
      <title>{title}</title>
      <defs>
        <mask id="hp-sprout-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
          <rect x="0" y="0" width="256" height="256" fill="white" />
          {/* sprout cutout */}
          <g transform="translate(0,6)" fill="black">
            <path d="M128 148c0-18 0-30 10-40 10-10 26-12 46-8 5 1 9 3 13 5-3 10-9 19-18 26-11 8-25 12-51 17z" />
            <path d="M128 148c0-18 0-30-10-40-10-10-26-12-46-8-5 1-9 3-13 5 3 10 9 19 18 26 11 8 25 12 51 17z" />
            <rect x="120" y="148" width="16" height="44" rx="8" />
          </g>
        </mask>
      </defs>
      <path
        fill="currentColor"
        mask="url(#hp-sprout-cut)"
        d="M176.4,30c-17.5,0-32.7,8.6-48.4,27.1C112.3,38.6,97.1,30,79.6,30
        C49.6,30,26,53.6,26,83.6c0,21.2,11.1,39.5,28.3,58.1c16,17.2,37.2,33.7,56.2,49.7
        c7.1,5.9,13.2,11,18.5,15.8c5.3-4.8,11.4-9.9,18.5-15.8c19-16,40.2-32.5,56.2-49.7
        C218.9,123.1,230,104.8,230,83.6C230,53.6,206.4,30,176.4,30z"
      />
    </svg>
  );
}
