import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useGetQaQcHistoryQuery } from "@/pages/qa-qc/data/qaqcData.slice";
import { formatDateTime } from "@/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import * as React from "react";

interface QaQcNestedRow {
  compound_name: string;
  measured_value: number | string | null;
  target_value: number | string | null;
  calculated_value: number | string | null;
  step_type: string;
  tank_type: string;
  linearity_pct?: number | string | null;
  pass_fail: boolean;
}

export const CalibrationHistory = () => {
  const [timeRange, setTimeRange] = React.useState<string>("24");
  const [customHours, setCustomHours] = React.useState<string>("24");

  const hoursToFetch = React.useMemo(() => {
    switch (timeRange) {
      case "24":
        return 24;
      case "168":
        return 168; // 7 days
      case "720":
        return 720; // 30 days
      case "all":
        return 99999; // effectively all time
      case "custom": {
        const parsed = parseInt(customHours, 10);
        return !isNaN(parsed) && parsed > 0 ? parsed : 24;
      }
      default:
        return 24;
    }
  }, [timeRange, customHours]);

  const { data, isLoading, isFetching, isError, error } =
    useGetQaQcHistoryQuery(
      { hours: hoursToFetch },
      { refetchOnMountOrArgChange: true }
    );

  const rows = data?.results ?? [];

  const [collapsed, setCollapsed] = React.useState<Set<number>>(new Set());
  const toggleRow = (idx: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const truncateTo = (value: unknown, decimals = 2): string => {
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value ?? "-");
    const factor = Math.pow(10, decimals);
    const truncated = Math.trunc(num * factor) / factor;
    return truncated.toFixed(decimals);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center">
            Calibration History{" "}
            <span className="mx-1.5 -mr-1.5 font-semibold text-neutral-400 text-lg">
              for
            </span>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="!bg-transparent !shadow-none -my-1 !px-3 !border-none text-lg">
                  <SelectValue className="!hover:text-primary-500" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">Last 24 Hours</SelectItem>
                  <SelectItem value="168">Last 7 Days</SelectItem>
                  <SelectItem value="720">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {timeRange === "custom" && (
                <div className="flex items-center gap-2 -my-1">
                  <Input
                    type="number"
                    min="1"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    className="min-w-0 [&>input]:max-w-[150px]"
                    placeholder="Hours"
                  />
                  <span className="text-neutral-500 text-sm">hours</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isFetching ? (
            <div className="text-xs">Loading...</div>
          ) : isError ? (
            <pre className="text-xs break-words whitespace-pre-wrap">
              {JSON.stringify(
                (error as { data?: unknown } | undefined)?.data ?? {
                  error: "Failed to load"
                },
                null,
                2
              )}
            </pre>
          ) : rows.length === 0 ? (
            <div className="text-neutral-500 text-xs">
              No history found
              {timeRange === "24" && " in the last 24 hours"}
              {timeRange === "168" && " in the last 7 days"}
              {timeRange === "720" && " in the last 30 days"}.
            </div>
          ) : (
            <Table className="text-sm border-separate border-spacing-y-0.5">
              <TableHeader className="bg-neutral-50">
                <TableRow className="border-none">
                  <TableHead className="px-3 w-[220px] h-9 font-medium text-neutral-500 text-xs uppercase tracking-wider">
                    Time
                  </TableHead>
                  <TableHead className="px-3 h-9 font-medium text-neutral-500 text-xs uppercase tracking-wider">
                    Job
                  </TableHead>
                  <TableHead className="px-3 h-9 font-medium text-neutral-500 text-xs uppercase tracking-wider">
                    Recipe
                  </TableHead>
                  <TableHead className="px-3 h-9 font-medium text-neutral-500 text-xs uppercase tracking-wider">
                    Step
                  </TableHead>
                  <TableHead className="px-3 h-9 font-medium text-neutral-500 text-xs text-right uppercase tracking-wider">
                    Overall
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((item, idx) => {
                  const nested: QaQcNestedRow[] = (() => {
                    try {
                      const parsed = item.qa_qc_result
                        ? JSON.parse(item.qa_qc_result)
                        : [];
                      return Array.isArray(parsed)
                        ? (parsed as QaQcNestedRow[])
                        : [];
                    } catch {
                      return [];
                    }
                  })();

                  const isOpen = collapsed.has(idx);

                  return (
                    <React.Fragment key={`fragment-${idx}`}>
                      <TableRow
                        className={`rounded-lg border-none cursor-pointer select-none ${
                          idx % 2 === 0 ? "bg-neutral-100" : "bg-white"
                        } hover:bg-neutral-50`}
                        onClick={() => toggleRow(idx)}
                      >
                        <TableCell className="px-3 py-2 rounded-l-lg">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-neutral-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-neutral-400" />
                            )}
                            <span>{formatDateTime(new Date(item.time))}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap">
                          #{item.job_id}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap">
                          {item.recipe_name || "-"}
                        </TableCell>
                        <TableCell className="px-3 py-2 whitespace-nowrap">
                          {item.step_type}
                        </TableCell>
                        <TableCell className="px-3 py-2 rounded-r-lg text-right">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                              item.overall_pass
                                ? "border border-primary-500/20 text-primary-600"
                                : "border border-red-600/20 text-red-600"
                            }`}
                          >
                            {item.overall_pass ? "Pass" : "Fail"}
                          </span>
                        </TableCell>
                      </TableRow>
                      {nested.length > 0 && isOpen && (
                        <TableRow key={`nested-${idx}`} className="border-0">
                          <TableCell colSpan={5} className="p-0">
                            <div className="gap-2 grid grid-cols-[1fr_auto] py-2 pr-3 pl-7">
                              <Table className="text-xs border-separate border-spacing-y-0">
                                <TableHeader className="bg-neutral-50">
                                  <TableRow className="border-none">
                                    <TableHead className="px-2 w-[240px] h-7 font-medium text-[10px] text-neutral-500 uppercase tracking-wider">
                                      Compound
                                    </TableHead>
                                    <TableHead className="px-2 h-7 font-medium text-[10px] text-neutral-500 text-right uppercase tracking-wider">
                                      Measured
                                    </TableHead>
                                    <TableHead className="px-2 h-7 font-medium text-[10px] text-neutral-500 text-right uppercase tracking-wider">
                                      Target
                                    </TableHead>
                                    <TableHead className="px-2 h-7 font-medium text-[10px] text-neutral-500 text-right uppercase tracking-wider">
                                      Deviation %
                                    </TableHead>
                                    <TableHead className="px-2 h-7 font-medium text-[10px] text-neutral-500 text-right uppercase tracking-wider">
                                      Linearity %
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {nested.map(
                                    (row: QaQcNestedRow, nIdx: number) => (
                                      <TableRow
                                        key={`n-${idx}-${nIdx}`}
                                        className={`rounded-md border-none hover:bg-transparent cursor-default ${
                                          nIdx % 2 === 0
                                            ? "bg-neutral-50"
                                            : "bg-white"
                                        }`}
                                      >
                                        <TableCell className="px-2 py-1.5 whitespace-nowrap">
                                          {row.compound_name}
                                        </TableCell>
                                        <TableCell className="px-2 py-1.5 tabular-nums text-right whitespace-nowrap">
                                          {truncateTo(row.measured_value)}
                                        </TableCell>
                                        <TableCell className="px-2 py-1.5 tabular-nums text-right whitespace-nowrap">
                                          {truncateTo(row.target_value)}
                                        </TableCell>
                                        <TableCell className="px-2 py-1.5 tabular-nums text-right whitespace-nowrap">
                                          {row.calculated_value != null
                                            ? truncateTo(
                                                Number(row.calculated_value) *
                                                  100
                                              )
                                            : "-"}
                                        </TableCell>
                                        <TableCell className="px-2 py-1.5 tabular-nums text-right whitespace-nowrap">
                                          {row.linearity_pct != null
                                            ? truncateTo(row.linearity_pct)
                                            : "-"}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                              <div className="text-xs">
                                <div className="h-7" />
                                {nested.map(
                                  (row: QaQcNestedRow, nIdx: number) => (
                                    <div
                                      key={`pf-${idx}-${nIdx}`}
                                      className="py-1.5 text-right whitespace-nowrap"
                                    >
                                      <span
                                        className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${
                                          row.pass_fail
                                            ? "border border-primary-500/20 text-primary-600"
                                            : "border border-red-600/20 text-red-600"
                                        }`}
                                      >
                                        {row.pass_fail ? "Pass" : "Fail"}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
