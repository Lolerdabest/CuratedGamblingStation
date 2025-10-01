import { SVGProps } from 'react';

export const Icons = {
  roulette: (props: SVGProps<SVGSVGElement>) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 12L19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 12L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19.0711 4.92896L16.9497 7.05028" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.05028 16.9497L4.92896 19.0711" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19.0711 19.0711L16.9497 16.9497" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.05028 7.05028L4.92896 4.92896" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};
