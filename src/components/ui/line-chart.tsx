"use client";

import {
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface LineChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  className?: string;
  valueFormatter?: (value: number) => string;
  showYAxis?: boolean;
  showXAxis?: boolean;
  showTooltip?: boolean;
  yAxisWidth?: number;
}

export function LineChart({
  data,
  categories,
  index,
  colors = ["#2563eb", "#ef4444", "#22c55e", "#f59e0b"],
  className,
  valueFormatter = (value: number) => value.toString(),
  showYAxis = true,
  showXAxis = true,
  showTooltip = true,
  yAxisWidth = 56
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsLineChart data={data} className={className}>
        {showXAxis && (
          <XAxis
            dataKey={index}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            isAnimationActive={false}
          />
        )}
        {showYAxis && (
          <YAxis
            width={yAxisWidth}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
            isAnimationActive={false}
          />
        )}
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload) return null;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {payload.map((item: any, index: number) => (
                      <div key={`item-${index}`} className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {item.name}
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {valueFormatter(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
        )}
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              className: "fill-background"
            }}
            isAnimationActive={true}
            animationDuration={300}
            animationEasing="linear"
            onAnimationStart={() => {
              /* empty */
            }}
            onAnimationEnd={() => {
              /* empty */
            }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
