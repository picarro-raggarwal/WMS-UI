import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import * as echarts from "echarts";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "../data-review/components/date-range-picker";
import {
  allRoomCompounds,
  allRoomIds,
  allRoomTags,
  mockRoomHistory,
  roomHeatmapCompound,
  roomHeatmapMatrixData,
  roomHeatmapRooms,
  roomHeatmapTimes
} from "./data/mock-data";

function parseDateTime(dateTimeStr: string) {
  // Assumes format 'YYYY-MM-DD HH:mm:ss'
  const [date, time] = dateTimeStr.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

const RoomHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [selectedCompounds, setSelectedCompounds] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  // Date range state: last 24 hours by default
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredHistory = useMemo(() => {
    return mockRoomHistory.filter((row) => {
      const rowDate = parseDateTime(row.timestamp);
      // Date range filter

      if (
        dateRange?.from &&
        dateRange?.to &&
        (rowDate < dateRange.from || rowDate > dateRange.to)
      ) {
        return false;
      }
      if (
        searchTerm &&
        !row.roomId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !row.compounds.some((c) =>
          c.toLowerCase().includes(searchTerm.toLowerCase())
        ) &&
        !row.currentTagsPresent.some((t) =>
          t.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ) {
        return false;
      }
      if (selectedRoomIds.length > 0 && !selectedRoomIds.includes(row.roomId)) {
        return false;
      }
      if (
        selectedCompounds.length > 0 &&
        !row.compounds.some((c) => selectedCompounds.includes(c))
      ) {
        return false;
      }
      if (
        selectedTags.length > 0 &&
        !row.currentTagsPresent.some((t) => selectedTags.includes(t))
      ) {
        return false;
      }
      return true;
    });
  }, [searchTerm, selectedRoomIds, selectedCompounds, selectedTags, dateRange]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRoomIds([]);
    setSelectedCompounds([]);
    setSelectedTags([]);
    setDateRange(undefined);
  };

  // Heatmap chart ref
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heatmapRef.current) return;
    const chart = echarts.init(heatmapRef.current);
    const option = {
      title: {
        text: `Total Exposure Heatmap (${roomHeatmapCompound})`,
        left: "center"
      },
      tooltip: {
        position: "top",
        formatter: (params: any) =>
          `Room: ${roomHeatmapRooms[Number(params.value[0])]}<br/>Time: ${
            roomHeatmapTimes[Number(params.value[1])]
          }<br/>Total Exposure: ${params.value[2]}`
      },
      grid: { height: "60%", top: 60 },
      xAxis: {
        type: "category",
        data: roomHeatmapTimes,
        splitArea: { show: true },
        name: "Time"
      },
      yAxis: {
        type: "category",
        data: roomHeatmapRooms,
        splitArea: { show: true },
        name: "Room"
      },
      visualMap: {
        type: "piecewise",
        pieces: [
          { min: 0, max: 100, color: "#2563eb" }, // primary-600
          { min: 101, max: 300, color: "#d97706" }, // amber-600
          { min: 301, color: "#4b5563" } // gray-600
        ],
        show: false,
        left: "center",
        bottom: "5%"
      },
      series: [
        {
          name: "Total Exposure",
          type: "heatmap",
          data: roomHeatmapMatrixData.map(([i, j, v]) => [
            Number(i),
            Number(j),
            v
          ]),
          label: { show: true },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" }
          }
        }
      ]
    };
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      {/* Heatmap visualization */}
      <div className="mb-8">
        <div ref={heatmapRef} style={{ width: "100%", height: 400 }} />
      </div>
      <div className="relative inset-px bg-white dark:bg-neutral-800 shadow-black/5 shadow-lg dark:shadow-none dark:border dark:border-neutral-700/20 rounded-xl ring-1 ring-black/5 text-neutral-950 dark:text-neutral-50">
        <div className="flex justify-between items-center gap-6 p-4 border-neutral-200 border-b">
          <div className="flex-1 min-w-[300px] max-w-[400px]">
            <Input
              placeholder="Search by Room Id, Compound, or Tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              size="sm"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Room Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`min-w-[100px] justify-between ${
                    selectedRoomIds.length > 0
                      ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : ""
                  }`}
                >
                  Room
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Select Rooms</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allRoomIds.map((roomId) => (
                  <DropdownMenuItem
                    key={roomId}
                    className="flex items-center space-x-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setSelectedRoomIds((prev) =>
                        prev.includes(roomId)
                          ? prev.filter((r) => r !== roomId)
                          : [...prev, roomId]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedRoomIds.includes(roomId)}
                      onCheckedChange={() =>
                        setSelectedRoomIds((prev) =>
                          prev.includes(roomId)
                            ? prev.filter((r) => r !== roomId)
                            : [...prev, roomId]
                        )
                      }
                    />
                    <span>{roomId}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Compound Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`min-w-[100px] justify-between ${
                    selectedCompounds.length > 0
                      ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : ""
                  }`}
                >
                  Compound
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Select Compounds</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allRoomCompounds.map((compound) => (
                  <DropdownMenuItem
                    key={compound}
                    className="flex items-center space-x-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setSelectedCompounds((prev) =>
                        prev.includes(compound)
                          ? prev.filter((c) => c !== compound)
                          : [...prev, compound]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedCompounds.includes(compound)}
                      onCheckedChange={() =>
                        setSelectedCompounds((prev) =>
                          prev.includes(compound)
                            ? prev.filter((c) => c !== compound)
                            : [...prev, compound]
                        )
                      }
                    />
                    <span>{compound}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Tag Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`min-w-[100px] justify-between ${
                    selectedTags.length > 0
                      ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : ""
                  }`}
                >
                  Tag
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Select Tags</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allRoomTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    className="flex items-center space-x-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        )
                      }
                    />
                    <span>{tag}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Date Range Picker as a filter button */}
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>
        </div>
        {/* Active Filters Row */}
        {(searchTerm ||
          selectedRoomIds.length > 0 ||
          selectedCompounds.length > 0 ||
          selectedTags.length > 0 ||
          (dateRange && dateRange.from && dateRange.to)) && (
          <div className="px-4 py-3 border-neutral-200">
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-neutral-600 text-sm">
                  Active filters:
                </span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchTerm}"
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() => setSearchTerm("")}
                    >
                      {" "}
                      <X className="w-3 h-3" />{" "}
                    </Button>
                  </Badge>
                )}
                {selectedRoomIds.map((roomId) => (
                  <Badge key={roomId} variant="secondary" className="gap-1">
                    Room: {roomId}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() =>
                        setSelectedRoomIds((prev) =>
                          prev.filter((r) => r !== roomId)
                        )
                      }
                    >
                      {" "}
                      <X className="w-3 h-3" />{" "}
                    </Button>
                  </Badge>
                ))}
                {selectedCompounds.map((compound) => (
                  <Badge key={compound} variant="secondary" className="gap-1">
                    Compound: {compound}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() =>
                        setSelectedCompounds((prev) =>
                          prev.filter((c) => c !== compound)
                        )
                      }
                    >
                      {" "}
                      <X className="w-3 h-3" />{" "}
                    </Button>
                  </Badge>
                ))}
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    Tag: {tag}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() =>
                        setSelectedTags((prev) => prev.filter((t) => t !== tag))
                      }
                    >
                      {" "}
                      <X className="w-3 h-3" />{" "}
                    </Button>
                  </Badge>
                ))}
                {dateRange && dateRange.from && dateRange.to && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {dateRange.from.toLocaleDateString()} -{" "}
                    {dateRange.to.toLocaleDateString()}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() => setDateRange(undefined)}
                    >
                      {" "}
                      <X className="w-3 h-3" />{" "}
                    </Button>
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="shrink-0"
              >
                {" "}
                <X className="mr-1 w-4 h-4" /> Clear All{" "}
              </Button>
            </div>
          </div>
        )}
        {/* Table */}
        <Card className="bg-transparent !shadow-none !border-none rounded-none !ring-0">
          <div className="relative inset-px flex flex-col bg-white dark:bg-neutral-800 shadow-black/5 shadow-xl dark:shadow-none p-6 dark:border dark:border-neutral-700/20 rounded-xl ring-1 ring-black/5 h-full text-neutral-950 dark:text-neutral-50">
            <Table className="border-separate border-spacing-y-0.5">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-none">
                  <TableHead className="w-[160px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Timestamp
                  </TableHead>
                  <TableHead className="w-[120px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Room Id
                  </TableHead>
                  <TableHead className="w-[160px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Current Concentration
                  </TableHead>
                  <TableHead className="w-[180px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Compounds
                  </TableHead>
                  <TableHead className="w-[200px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Current Tags Present
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-neutral-400 text-center"
                    >
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((row, idx) => (
                    <TableRow
                      key={row.timestamp + row.roomId + idx}
                      className={idx % 2 === 0 ? "bg-neutral-100" : "bg-white"}
                    >
                      <TableCell className="px-4 py-3 rounded-l-lg font-mono text-xs">
                        {row.timestamp}
                      </TableCell>
                      <TableCell className="px-4 py-3">{row.roomId}</TableCell>
                      <TableCell className="px-4 py-3">
                        {row.currentConcentration}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {row.compounds.join(", ")}
                      </TableCell>
                      <TableCell className="px-4 py-3 rounded-r-lg">
                        {row.currentTagsPresent.join(", ")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoomHistory;
