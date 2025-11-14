import { EmptyStateInfo } from "@/components/empty-state-info";
import { Spinner } from "@/components/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDataCompletenessQuery } from "@/pages/qa-qc/data/qaqc.slice";
import { AlertTriangle } from "lucide-react";

type DataCompletenessProps = {
  selectedPeriod: "last30" | "active";
};

export const DataCompleteness = ({ selectedPeriod }: DataCompletenessProps) => {
  const query_type = selectedPeriod === "active" ? "active_quarter" : "30";

  const { data, isLoading, isFetching, isError, error } =
    useGetDataCompletenessQuery(
      { query_type },
      { refetchOnMountOrArgChange: true }
    );

  if (isLoading || isFetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Completeness Tracking</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Spinner size="8" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Completeness Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyStateInfo
            className="w-full"
            title={(error as any)?.data?.error?.name || "Service Unavailable"}
            description={
              (error as any)?.data?.error?.message ||
              "Unable to fetch data completeness right now"
            }
            icon={<AlertTriangle />}
          />
        </CardContent>
      </Card>
    );
  }

  const success = (data as any)?.data_completeness;
  const target = (data as any)?.target;
  const meetTarget = (data as any)?.meet_target;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Completeness Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-3 mt-2 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Valid Points</p>
              <p className="font-semibold text-xl">
                {success.valid_data_points}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Total Points</p>
              <p className="font-semibold text-xl">
                {success.total_data_points}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Completeness</p>
              <p className="font-semibold text-xl">
                {(success.completeness_fraction * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Target</p>
              <p className="font-semibold text-xl">
                {(target * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Meets Target</p>
              <p
                className={`text-xl font-semibold ${
                  meetTarget ? "text-green-600" : "text-red-600"
                }`}
              >
                {meetTarget ? "Yes" : "No"}
              </p>
            </div>
          </div>
        ) : (
          <EmptyStateInfo
            className="w-full"
            title={(data as any)?.error?.name || "Service Unavailable"}
            description={
              (data as any)?.error?.message ||
              "Unable to fetch data completeness"
            }
            icon={<AlertTriangle />}
          />
        )}
      </CardContent>
    </Card>
  );
};
