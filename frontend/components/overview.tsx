'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const data = [
  {
    name: 'Oct',
    total: 500,
  },
  {
    name: 'Nov',
    total: 900,
  },
  {
    name: 'Dec',
    total: 700,
  },
  {
    name: 'Jan',
    total: 800,
  },
  {
    name: 'Feb',
    total: 1100,
  },
  {
    name: 'Mar',
    total: 950,
  },
];

export function Overview() {
  return (
    <ChartContainer
      config={{
        total: {
          label: 'Earnings',
          color: '#9747ff',
        },
      }}
      className="h-[250px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="total"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: '#9747ff' },
            }}
            style={{
              stroke: 'var(--color-total)',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
