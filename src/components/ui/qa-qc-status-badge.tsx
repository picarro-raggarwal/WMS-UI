import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  useGetQaQcStateQuery,
  type QaQcStateResponse,
  type FailedComponent,
} from "@/pages/qa-qc/data/qaqcData.slice";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function QaQcStatusBadge() {
  const { data, isLoading, isFetching, isError } = useGetQaQcStateQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const state = (data?.state || "").toString().toLowerCase();
  const hasFailed =
    state === "failed" && data?.failed_components && data.failed_components.length > 0;
  const isChecking = isLoading || isFetching;

  let variant: BadgeVariant = "default";
  let className: string | undefined;

  if (isChecking) {
    variant = "outline";
    className =
      "bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 animate-pulse";
  } else if (isError) {
    variant = "destructive";
  } else if (state === "passed") {
    variant = "secondary";
    className =
      "bg-primary-500 text-neutral-50 border-transparent capitalize hover:bg-primary-600 dark:bg-primary-600";
  } else if (state === "failed") {
    variant = "destructive";
  } else {
    variant = "default";
  }

  const badgeContent = (
    <Badge variant={variant} className={className}>
      {!isChecking && state === "failed" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="mr-1 w-3 h-3">
          <path
            fillRule="evenodd"
            d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {!isChecking && state === "passed" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="mr-1 w-3 h-3">
          <path
            fillRule="evenodd"
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {isChecking ? "Checking..." : data?.state ?? "Unknown"}
    </Badge>
  );

  if (!hasFailed) {
    return badgeContent;
  }

  // Group failed components by step type for better organization
  const groupedFailures = (data?.failed_components || []).reduce((acc, component) => {
    const key = `${component.step_type}_${component.tank_type}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(component);
    return acc;
  }, {} as Record<string, FailedComponent[]>);

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer">{badgeContent}</span>
      </HoverCardTrigger>
      <HoverCardContent
        className="shadow-xl rounded-2xl w-96 max-h-96 overflow-y-auto"
        side="bottom"
        align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 text-red-500">
              <path
                fillRule="evenodd"
                d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <h4 className="font-semibold text-sm">Failed Components</h4>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedFailures).map(([key, components]) => {
              const firstComponent = components[0];
              const stepType = firstComponent.step_type.replace(/_/g, " ");
              const tankType = firstComponent.tank_type.replace(/_/g, " ");

              return (
                <div key={key} className="space-y-2 tracking-normal">
                  <div className="font-medium text-neutral-600 dark:text-neutral-400 text-xs uppercase">
                    {stepType} - {tankType}
                  </div>
                  <div className="space-y-1.5">
                    {components.map((component, idx) => (
                      <div
                        key={`${component.compound_id}_${idx}`}
                        className="space-y-1 bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded-lg text-xs">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100">
                          {component.compound_name.replace(/_/g, " ")}
                        </div>
                        <div className="gap-x-3 grid grid-cols-2 text-neutral-600 dark:text-neutral-400">
                          <div>
                            <span className="text-neutral-500 dark:text-neutral-500">
                              Measured:
                            </span>{" "}
                            {component.measured_value.toFixed(2)}
                          </div>
                          <div>
                            <span className="text-neutral-500 dark:text-neutral-500">Target:</span>{" "}
                            {component.target_value.toFixed(2)}
                          </div>
                          {component.calculated_value !== null && (
                            <div className="col-span-2">
                              <span className="text-neutral-500 dark:text-neutral-500">
                                Calculated:
                              </span>{" "}
                              {component.calculated_value.toFixed(4)}
                            </div>
                          )}
                          {component.linearity_pct !== null && (
                            <div className="col-span-2">
                              <span className="text-neutral-500 dark:text-neutral-500">
                                Linearity:
                              </span>{" "}
                              {component.linearity_pct}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {data?.missing_components && data.missing_components.length > 0 && (
            <div className="pt-2 border-neutral-200 dark:border-neutral-800 border-t">
              <div className="mb-1 font-medium text-neutral-600 dark:text-neutral-400 text-xs">
                Missing Components
              </div>
              <div className="text-neutral-500 dark:text-neutral-500 text-xs">
                {data.missing_components.join(", ")}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
