import { useLocation } from "react-router";
import { QaQcStatusBadge } from "./qa-qc-status-badge";

// Create a mapping of routes to page names
const routeToPageName: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/live-data": "Live Data",
  "/dashboard/data-review": "Data Review",
  "/dashboard/qa-qc": "QA/QC",
  "/dashboard/method": "Method",
  "/dashboard/method/create": "Create Recipe",
  "/dashboard/settings": "Settings",
  "/dashboard/service": "Service",
  "/dashboard/alerts": "Alerts",
  "/dashboard/personal-exposure": "Personal Exposure"
};

interface PageHeaderProps {
  pageName?: string | React.ReactNode;
  alertCount?: number;
  children?: React.ReactNode;
}

export function PageHeader({
  pageName: propPageName,
  alertCount = 3,
  children = null
}: PageHeaderProps) {
  const location = useLocation();
  const showQaQc = propPageName === "Quality Assurance & Control";

  // Determine page name from route or use the prop if provided
  const pageName =
    propPageName || routeToPageName[location.pathname] || "Dashboard";

  return (
    <header className="relative flex items-center gap-2 bg-white dark:bg-neutral-800/20 shadow-sm border-neutral-100 dark:border-neutral-700 rounded-tl-xl shrink-0">
      <div className="mx-auto w-full max-w-8xl">
        <div className="flex justify-between items-center px-8 md:px-12 py-5">
          <div className="flex items-center gap-3 font-semibold text-gray-900 dark:text-gray-50 text-xl tracking-tight">
            {pageName}
            {showQaQc && <QaQcStatusBadge />}
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
