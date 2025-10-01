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
};
