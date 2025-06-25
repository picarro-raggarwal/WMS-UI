import { Card, CardContent } from "@/components/ui/card";
import { ProgressCircle } from "@/components/tremor/progress-circle";

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
}

const MetricCard = ({ title, value, subtitle }: MetricCardProps) => (
  <Card className="  hover:bg-accent/50 transition-colors ">
    <CardContent className="flex flex-col items-center justify-center py-6 h-full">
      <p className="text-base font-semibold tracking-tight text-black dark:text-gray-500">
        {title}
      </p>
      <p className="text-xs text-neutral-500 mb-4 text-center">Description for {title} </p>

      <ProgressCircle value={value} radius={50} strokeWidth={8}>
        <p className="font-semibold text-xl tracking-tight">{value}%</p>
      </ProgressCircle>
      <span className="text-xs text-muted-foreground mt-4">{subtitle}</span>
    </CardContent>
  </Card>
);

interface SystemMetricsProps {
  selectedPeriod?: "last30" | "active";
}

export const SystemMetrics = ({ selectedPeriod = "last30" }: SystemMetricsProps) => {
  const mockMetrics = {
    uptime: selectedPeriod === "last30" ? 50 : 71,
    dataCompleteness: selectedPeriod === "last30" ? 87.5 : 99.5,
    calibrationSuccess: selectedPeriod === "last30" ? 97 : 48.5,
  };

  const periodLabel = selectedPeriod === "last30" ? "Last 30 days" : "Active reporting period";

  return (
    <div className=" t grid gap-6 md:grid-cols-3  ">
      <MetricCard title="System Uptime" value={mockMetrics.uptime} subtitle={periodLabel} />
      <MetricCard
        title="Data Completeness"
        value={mockMetrics.dataCompleteness}
        subtitle={periodLabel}
      />
      <MetricCard
        title="Calibration Success Rate"
        value={mockMetrics.calibrationSuccess}
        subtitle={periodLabel}
      />
    </div>
  );
};
