import { SVGProps } from 'react';

const rouletteNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const numberColors: { [key: number]: 'red' | 'black' | 'green' } = {0: 'green', 1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black', 7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red', 19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red', 31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'};

const TOTAL_NUMBERS = 37;
const ANGLE_PER_SEGMENT = 360 / TOTAL_NUMBERS;
const RADIUS = 100;

export const Icons = {
  roulette: (props: SVGProps<SVGSVGElement>) => (
     <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <path id="circle-path" d={`M ${120 - RADIUS},120 a ${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a ${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`}></path>
      </defs>

      <g transform="translate(120, 120)">
        {rouletteNumbers.map((number, index) => {
          const startAngle = (index * ANGLE_PER_SEGMENT) - (ANGLE_PER_SEGMENT / 2) - 90;
          const endAngle = startAngle + ANGLE_PER_SEGMENT;

          const startX = RADIUS * Math.cos(startAngle * Math.PI / 180);
          const startY = RADIUS * Math.sin(startAngle * Math.PI / 180);
          const endX = RADIUS * Math.cos(endAngle * Math.PI / 180);
          const endY = RADIUS * Math.sin(endAngle * Math.PI / 180);
          const largeArcFlag = ANGLE_PER_SEGMENT > 180 ? 1 : 0;
          
          const color = numberColors[number] === 'red' ? '#dc2626' : numberColors[number] === 'black' ? '#1f2937' : '#16a34a';

          return (
            <g key={number}>
              <path 
                d={`M 0,0 L ${startX},${startY} A ${RADIUS},${RADIUS} 0 ${largeArcFlag} 1 ${endX},${endY} Z`}
                fill={color}
                stroke="#4b5563"
                strokeWidth="0.5"
              />
              <text 
                transform={`rotate(${startAngle + ANGLE_PER_SEGMENT / 2 + 90}) translate(0, -${RADIUS - 15}) rotate(${-(startAngle + ANGLE_PER_SEGMENT / 2 + 90)})`}
                fill="white"
                fontSize="10"
                textAnchor="middle"
                alignmentBaseline="middle"
                fontWeight="bold"
              >
                {number}
              </text>
            </g>
          )
        })}
        <circle cx="0" cy="0" r="20" fill="#1e293b" stroke="#fde047" strokeWidth="2" />
      </g>
    </svg>
  ),
  gift: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 6.25A3.25 3.25 0 0 1 6.25 3h11.5A3.25 3.25 0 0 1 21 6.25V9h-9V3.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V9H3V6.25ZM21 11v7.75A3.25 3.25 0 0 1 17.75 22H6.25A3.25 3.25 0 0 1 3 18.75V11h18Z"/>
      <path d="M11 9H3v2h8V9Zm2 2h8V9h-8v2Z" opacity="0.5"/>
    </svg>
  ),
  bomb: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8Z"/>
      <path d="m14.33 6.2-3.4 3.4.9.9a.5.5 0 0 1 0 .7l-1.06 1.06a.5.5 0 0 1-.7 0l-.9-.9-3.4 3.4a.5.5 0 0 0 0 .7l.7.7a.5.5 0 0 0 .7 0l3.4-3.4.9.9a.5.5 0 0 1 0 .7l-1.06 1.06a.5.5 0 0 1-.7 0l-.9-.9-2.12 2.12a.5.5 0 0 0 0 .7l.7.7a.5.5 0 0 0 .7 0l6.18-6.18a.5.5 0 0 0 0-.7l-.7-.7a.5.5 0 0 0-.7 0Z" opacity="0.5"/>
      <path d="M17.1 4.4a.5.5 0 0 0-.7 0l-1.5 1.5a.5.5 0 0 0 0 .7l.7.7a.5.5 0 0 0 .7 0l1.5-1.5a.5.5 0 0 0 0-.7l-.7-.7Z"/>
    </svg>
  ),
  spade: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c-3.1 0-4.65 2.3-5.5 4.54-.53 1.4-1.3 3.63-1.42 5.34-.11 1.6.26 3.12.92 4.12.93 1.4 2.7 2.7 5.2 3.8.35.15.75.15 1.1 0 2.5-1.1 4.27-2.4 5.2-3.8.66-1 .93-2.52.92-4.12-.12-1.7-.89-3.93-1.42-5.34C16.65 4.3 15.1 2 12 2Zm-1 16.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4Zm4 0a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4Z"/>
    </svg>
  ),
  ticket: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.25 3.5c-.69 0-1.25.56-1.25 1.25S14.56 6 15.25 6h.5c.69 0 1.25-.56 1.25-1.25S16.44 3.5 15.75 3.5h-.5ZM6 15.25c0 .69.56 1.25 1.25 1.25h.5c.69 0 1.25-.56 1.25-1.25S8.44 14 7.75 14h-.5C6.56 14 6 14.56 6 15.25Zm-2.5-7C2.67 8.25 2 8.83 2 9.75v.5c0 .92.67 1.5 1.5 1.5h17c.83 0 1.5-.58 1.5-1.5v-.5c0-.92-.67-1.5-1.5-1.5h-17Z"/>
      <path d="M20.5 14h-17C2.67 14 2 14.58 2 15.5v.5c0 .92.67 1.5 1.5 1.5h17c.83 0 1.5-.58 1.5-1.5v-.5c0-.92-.67-1.5-1.5-1.5Z" opacity=".5"/>
      <path d="M15.25 8c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25h.5c.69 0 1.25-.56 1.25-1.25S16.44 8 15.75 8h-.5ZM6 19.25c0 .69.56 1.25 1.25 1.25h.5c.69 0 1.25-.56 1.25-1.25S8.44 18 7.75 18h-.5c-.69 0-1.25.56-1.25 1.25Z"/>
    </svg>
  )
};
