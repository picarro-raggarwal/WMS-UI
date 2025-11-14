import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { AuditLogs } from "./components/audit-logs";
import { CalibrationHistory } from "./components/calibration-history";
import { DataCompleteness } from "./components/data-completeness";
import { GasCylinders } from "./components/gas-cylinders";
import { SystemMetrics } from "./components/system-metrics";

const QAQCPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"last30" | "active">(
    "last30"
  );
  const tabsTriggerClasses =
    "py-3 mb-1 rounded-none  data-[state=active]:bg-neutral-50  border-b-2 data-[state=active]:border-primary-500  ";
  return (
    <>
      <PageHeader />
      <main className="max-w-8xl mx-auto py-6 h-full overflow-y-auto w-full px-8 md:px-12 space-y-8">
        <div className=" ">
          <div className="flex justify-between items-center mb-4">
            <Select
              defaultValue="last30"
              onValueChange={(value: "last30" | "active") =>
                setSelectedPeriod(value)
              }
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="active">Active Reporting Period</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4 mr-1" />
                Export QA Report
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-4 w-4 mr-1" />
                Cloud Audit Logs
              </Button>
            </div>
          </div>
          <SystemMetrics selectedPeriod={selectedPeriod} />
          <div className="mt-8 border-t border-neutral-200 pt-8">
            <Tabs defaultValue="cylinders" className="w-full">
              <TabsList className=" border-b border-neutral-200 w-full    rounded-none  p-2 flex items-center justify-start gap-2">
                <TabsTrigger value="cylinders" className={tabsTriggerClasses}>
                  Gas Cylinders
                </TabsTrigger>
                <TabsTrigger value="calibration" className={tabsTriggerClasses}>
                  Calibration History
                </TabsTrigger>
                <TabsTrigger
                  value="completeness"
                  className={tabsTriggerClasses}
                >
                  Data Completeness
                </TabsTrigger>
                <TabsTrigger value="audit" className={tabsTriggerClasses}>
                  Audit Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cylinders">
                <GasCylinders />
              </TabsContent>

              <TabsContent value="calibration">
                <CalibrationHistory />
              </TabsContent>

              <TabsContent value="completeness">
                <DataCompleteness selectedPeriod={selectedPeriod} />
              </TabsContent>

              <TabsContent value="audit">
                <AuditLogs />
              </TabsContent>
            </Tabs>
          </div>{" "}
        </div>
      </main>
    </>
  );
};

export default QAQCPage;
