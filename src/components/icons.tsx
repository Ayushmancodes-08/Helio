import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L12 22" />
      <path d="M2 12L22 12" />
      <path d="M12 2a5 5 0 0 0-5 5c0 1.66.84 3.13 2.1 4H5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h4.1c-1.26.87-2.1 2.34-2.1 4a5 5 0 0 0 5 5" />
      <path d="M12 2a5 5 0 0 1 5 5c0 1.66-.84 3.13-2.1 4H19c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-4.1c1.26.87 2.1 2.34 2.1 4a5 5 0 0 1-5 5" />
    </svg>
  );
}
