import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  date: string;
  completeness: number;
}

const mockDailyData: DataPoint[] = [
  { date: "02/10", completeness: 98 },
  { date: "02/11", completeness: 100 },
  { date: "02/12", completeness: 99 },
  { date: "02/13", completeness: 97 },
  { date: "02/14", completeness: 100 },
  { date: "02/15", completeness: 100 },
  { date: "02/16", completeness: 99 },
];

const mockWeeklyData: DataPoint[] = [
  { date: "Week 1", completeness: 99 },
  { date: "Week 2", completeness: 98 },
  { date: "Week 3", completeness: 100 },
  { date: "Week 4", completeness: 99 },
];

const mockMonthlyData: DataPoint[] = [
  { date: "Jan", completeness: 98 },
  { date: "Feb", completeness: 99 },
  { date: "Mar", completeness: 97 },
  { date: "Apr", completeness: 99 },
  { date: "May", completeness: 100 },
  { date: "Jun", completeness: 98 },
];

export const DataCompleteness = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Completeness Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="w-full">
            {/* <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[90, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Completeness"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="completeness" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div> */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-xl font-semibold">99.0%</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-500">Minimum</p>
                <p className="text-xl font-semibold">97.0%</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-500">Target</p>
                <p className="text-xl font-semibold">95.0%</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="w-full"></TabsContent>

          <TabsContent value="monthly" className="w-full"></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
