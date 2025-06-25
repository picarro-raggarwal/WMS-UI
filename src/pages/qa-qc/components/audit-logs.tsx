import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Filter } from "lucide-react";
import { useState } from "react";

interface AuditLog {
  id: string;
  timestamp: string;
  eventType: "Calibration" | "System" | "User" | "Data";
  description: string;
  user: string;
  severity: "Info" | "Warning" | "Error";
}

const mockLogs: AuditLog[] = [
  {
    id: "LOG-001",
    timestamp: "2024-02-16 09:15:22",
    eventType: "Calibration",
    description: "Zero calibration completed successfully",
    user: "System",
    severity: "Info",
  },
  {
    id: "LOG-002",
    timestamp: "2024-02-16 09:30:45",
    eventType: "System",
    description: "System restarted due to scheduled maintenance",
    user: "admin",
    severity: "Info",
  },
  {
    id: "LOG-003",
    timestamp: "2024-02-15 14:22:10",
    eventType: "Data",
    description: "Data gap detected (15 minutes)",
    user: "System",
    severity: "Warning",
  },
  {
    id: "LOG-004",
    timestamp: "2024-02-15 10:05:33",
    eventType: "User",
    description: "Configuration updated: Sampling interval changed to 5 min",
    user: "operator",
    severity: "Info",
  },
  {
    id: "LOG-005",
    timestamp: "2024-02-14 16:45:12",
    eventType: "Calibration",
    description: "Span calibration failed - out of tolerance",
    user: "System",
    severity: "Error",
  },
];

export const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType = eventTypeFilter === "all" || log.eventType === eventTypeFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;

    return matchesSearch && matchesEventType && matchesSeverity;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Audit Logs</CardTitle>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="Calibration">Calibration</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Data">Data</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Info">Info</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                <TableCell>{log.eventType}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                      log.severity === "Info"
                        ? "border border-primary-500/20 text-primary-500"
                        : log.severity === "Warning"
                        ? "border border-amber-600/20 text-amber-600"
                        : "border border-red-600/20 text-red-600"
                    }`}>
                    {log.severity}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div>
            Showing {filteredLogs.length} of {mockLogs.length} logs
          </div>
          <div>Last 30 days</div>
        </div>
      </CardContent>
    </Card>
  );
};
