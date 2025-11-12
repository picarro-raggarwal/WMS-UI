import { EmptyStateInfo } from "@/components/empty-state-info";
import { PageHeader } from "@/components/ui/page-header";
import { Table2 } from "lucide-react";

const PersonalExposurePage = () => {
  return (
    <>
      <PageHeader />
      <main className="flex flex-col mx-auto px-8 md:px-12 py-8 w-full max-w-8xl h-full overflow-y-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyStateInfo
            title="Coming Soon..."
            description="Personal Exposure Management feature is currently under development and will be available soon."
            icon={<Table2 />}
            className="w-full max-w-md"
          />
        </div>
      </main>
    </>
  );
};

export default PersonalExposurePage;
