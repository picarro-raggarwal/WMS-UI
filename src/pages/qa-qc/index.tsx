import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { CalibrationHistory } from "./components/calibration-history";
import { DataCompleteness } from "./components/data-completeness";
import { GasCylinders } from "./components/gas-cylinders";
import { QAQCExportDialog } from "./components/qa-qc-export-dialog";
import { SystemMetrics } from "./components/system-metrics";

const QAQCPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<"last30" | "active">(
    "last30"
  );

  const tabsTriggerClasses = `px-1 py-3 
   border-b-2 border-transparent mb-[4px] text-neutral-600 hover:text-neutral-900 rounded-none
     transition-colors data-[state=active]:bg-transparent data-[state=active]:border-primary-500
      data-[state=active]:text-black`;

  return (
    <>
      <PageHeader pageName="Quality Assurance & Control">
        <QAQCExportDialog />
      </PageHeader>
      <main className="space-y-8 mx-auto px-8 md:px-12 py-6 w-full max-w-8xl h-full overflow-y-auto">
        <div className=" ">
          <div className="flex justify-between items-center mb-4">
            <Select
              defaultValue="last30"
              onValueChange={(value: "last30" | "active") =>
                setSelectedPeriod(value)
              }
            >
              <SelectTrigger className="bg-white w-[240px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="active">Active Reporting Period</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SystemMetrics selectedPeriod={selectedPeriod} />
          <div className="mt-8 rounded-none">
            <Tabs defaultValue="cylinders" className="w-full">
              <TabsList className="flex justify-start items-center gap-3 bg-neutral-50 mb-4 -ml-1 p-0 border-neutral-200 border-b rounded-none w-full">
                <TabsTrigger value="cylinders" className={tabsTriggerClasses}>
                  Gas Cylinders
                </TabsTrigger>
                <TabsTrigger value="calibration" className={tabsTriggerClasses}>
                  Calibration History
                </TabsTrigger>
                {/* <TabsTrigger value="completeness" className={tabsTriggerClasses}>
                  Data Completeness
                </TabsTrigger>
                <TabsTrigger value="audit" className={tabsTriggerClasses}>
                  Audit Logs
                </TabsTrigger> */}
              </TabsList>

              <TabsContent value="cylinders" className="mt-0">
                <div className="shadow-sm rounded-xl">
                  <GasCylinders />
                </div>
              </TabsContent>

              <TabsContent value="calibration" className="mt-0">
                <div className="shadow-sm rounded-xl">
                  <CalibrationHistory />
                </div>
              </TabsContent>

              <TabsContent value="completeness" className="mt-0">
                <div className="bg-white shadow-sm rounded-xl">
                  <DataCompleteness selectedPeriod={selectedPeriod} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
};

export default QAQCPage;
