import { useMemo } from "react";
import { Alert, severityMap, normalizeSeverity } from "../data/alerts.slice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { formatTime } from "@/utils";

interface AlertsTimelineProps {
  alerts: Alert[];
}

interface TimelineDataPoint {
  time: string;
  timeRange: string;
  fullDateTime: string;
  CRITICAL: number;
  HIGH: number;
  WARNING: number;
  INFO: number;
  total: number;
}

interface CustomBarProps {
  payload?: TimelineDataPoint;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const severityColors = {
  CRITICAL: "#991b1b", // red-800
  HIGH: "#ef4444", // red-500
  WARNING: "#a3a3a3", // neutral-400
  INFO: "#e5e5e5", // neutral-200
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as TimelineDataPoint;

  return (
    <div className="bg-neutral-900 shadow-xl p-3 border-none rounded-lg text-white text-sm">
      <div className="mb-1 font-medium text-white">{data.timeRange}</div>
      <div className="mb-2 text-neutral-100 text-sm">{data.fullDateTime.split(",")[0]}</div>
      {data.total > 0 ? (
        <div className="space-y-1">
          <div className="font-medium">Total: {data.total} alerts</div>
          {data.CRITICAL > 0 && <div className="text-white">Critical: {data.CRITICAL}</div>}
          {data.HIGH > 0 && <div className="text-neutral-100">High: {data.HIGH}</div>}
          {data.WARNING > 0 && <div className="text-neutral-100">Warning: {data.WARNING}</div>}
          {data.INFO > 0 && <div className="text-neutral-100">Info: {data.INFO}</div>}
        </div>
      ) : (
        <div className="text-neutral-100">No alerts</div>
      )}
    </div>
  );
};

// Custom bar component for stacked effect
const CustomBar = (props: CustomBarProps) => {
  const { payload, x, y, width, height } = props;
  if (!payload || !x || !y || !width || height === undefined || height <= 0) return null;

  const { CRITICAL, HIGH, WARNING, INFO, total } = payload;

  if (total === 0) {
    // Show minimal gray bar for empty periods
    return <rect x={x} y={y + height - 2} width={width} height={2} fill="#f3f4f6" rx={1} />;
  }

  // Ensure minimum height of 3px for any bar with alerts
  const minBarHeight = 3;
  const actualHeight = Math.max(height, minBarHeight);
  const adjustedY = y + height - actualHeight;

  // Calculate heights for each severity
  const sections = [];
  let currentY = adjustedY + actualHeight;

  if (INFO > 0) {
    const sectionHeight = (INFO / total) * actualHeight;
    currentY -= sectionHeight;
    sections.push({
      y: currentY,
      height: sectionHeight,
      fill: severityColors.INFO,
    });
  }

  if (WARNING > 0) {
    const sectionHeight = (WARNING / total) * actualHeight;
    currentY -= sectionHeight;
    sections.push({
      y: currentY,
      height: sectionHeight,
      fill: severityColors.WARNING,
    });
  }

  if (HIGH > 0) {
    const sectionHeight = (HIGH / total) * actualHeight;
    currentY -= sectionHeight;
    sections.push({
      y: currentY,
      height: sectionHeight,
      fill: severityColors.HIGH,
    });
  }

  if (CRITICAL > 0) {
    const sectionHeight = (CRITICAL / total) * actualHeight;
    currentY -= sectionHeight;
    sections.push({
      y: currentY,
      height: sectionHeight,
      fill: severityColors.CRITICAL,
    });
  }

  return (
    <g>
      {sections.map((section, index) => (
        <rect
          key={index}
          x={x}
          y={section.y}
          width={width}
          height={section.height}
          fill={section.fill}
          rx={index === sections.length - 1 ? 2 : 0} // Round top of highest section
        />
      ))}
    </g>
  );
};

export const AlertsTimeline = ({ alerts }: AlertsTimelineProps) => {
  const timelineData = useMemo(() => {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    // Create 30-minute buckets - 48 buckets for 24 hours
    const buckets: TimelineDataPoint[] = [];

    // Initialize 48 30-minute buckets (most recent first)
    for (let i = 0; i < 48; i++) {
      const bucketEndTime = new Date(now - i * 30 * 60 * 1000);
      const bucketStartTime = new Date(now - (i + 1) * 30 * 60 * 1000);

      buckets.push({
        time: formatTime(bucketEndTime),
        timeRange: `${formatTime(bucketStartTime)} - ${formatTime(bucketEndTime)}`,
        fullDateTime: bucketEndTime.toLocaleString(),
        CRITICAL: 0,
        HIGH: 0,
        WARNING: 0,
        INFO: 0,
        total: 0,
      });
    }

    // Place alerts into buckets
    alerts.forEach((alert) => {
      const alertTime = new Date(alert.last_timestamp * 1000);

      if (alertTime.getTime() >= last24Hours) {
        const minutesAgo = Math.floor((now - alertTime.getTime()) / (30 * 60 * 1000));

        if (minutesAgo >= 0 && minutesAgo < 48) {
          const bucket = buckets[minutesAgo];
          const severity = severityMap[normalizeSeverity(alert.severity)];

          if (severity && severity in severityColors) {
            bucket[severity as keyof typeof severityColors] += alert.repeat_count;
            bucket.total += alert.repeat_count;
          }
        }
      }
    });

    return buckets.reverse();
  }, [alerts]);

  const maxTotal = Math.max(...timelineData.map((d) => d.total), 1);

  return (
    <div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timelineData}
            margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
            barCategoryGap={1}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e5e5"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#737373" }}
              interval="preserveStartEnd"
              tickFormatter={(value, index) => {
                // Show every 8th label (every 4 hours) to avoid crowding
                return index % 8 === 0 || index === timelineData.length - 1 ? value : "";
              }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Bar dataKey="total" shape={<CustomBar />} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center bg-gray-50 mt-2 px-4 py-3 rounded-lg">
        <div className="text-neutral-500 text-xs">Alerts over the last 24 hours</div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="bg-red-800 rounded-sm w-3 h-3"></div>
            <span className="text-neutral-600">Critical</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-red-500 rounded-sm w-3 h-3"></div>
            <span className="text-neutral-600">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-neutral-400 rounded-sm w-3 h-3"></div>
            <span className="text-neutral-600">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-neutral-300 rounded-sm w-3 h-3"></div>
            <span className="text-neutral-600">Info</span>
          </div>
        </div>
      </div>
    </div>
  );
};
