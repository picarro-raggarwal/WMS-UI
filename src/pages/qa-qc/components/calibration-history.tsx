import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CalibrationEvent {
  id: string;
  date: string;
  type: "Zero" | "Span" | "Multi-Point";
  target: string;
  measured: string;
  deviation: string;
  status: "Pass" | "Fail";
  operator: string;
}

const mockCalibrations: CalibrationEvent[] = [
  {
    id: "CAL-001",
    date: "2024-02-15 14:30",
    type: "Zero",
    target: "0 ppb",
    measured: "0.2 ppb",
    deviation: "0.2 ppb",
    status: "Pass",
    operator: "Auto",
  },
  {
    id: "CAL-002",
    date: "2024-02-15 14:45",
    type: "Span",
    target: "100 ppb",
    measured: "98.5 ppb",
    deviation: "-1.5%",
    status: "Pass",
    operator: "Auto",
  },
];

export const CalibrationHistory = () => {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Calibration History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Measured</TableHead>
                <TableHead>Deviation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Operator</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCalibrations.map((cal) => (
                <TableRow key={cal.id}>
                  <TableCell>{cal.date}</TableCell>
                  <TableCell>{cal.type}</TableCell>
                  <TableCell>{cal.target}</TableCell>
                  <TableCell>{cal.measured}</TableCell>
                  <TableCell>{cal.deviation}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        cal.status === "Pass"
                          ? "border border-primary-500/20 text-primary-500"
                          : "border border-red-600/20 text-red-600"
                      }`}>
                      {cal.status}
                    </span>
                  </TableCell>
                  <TableCell>{cal.operator}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
