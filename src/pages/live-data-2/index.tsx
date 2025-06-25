import { PageHeader } from "@/components/ui/page-header";
import { useState } from "react";
import { BlockGrid } from "./components/BlockGrid";
import { DetailsPanel } from "./components/DetailsPanel";
import { generateMockData, MockData } from "./data/mock-data";

const TOTAL_PORTS = 64;

const liveData = generateMockData(TOTAL_PORTS);

const LiveDataPage = () => {
  const [selectedBlock, setSelectedBlock] = useState<MockData | null>(null);

  return (
    <>
      <PageHeader />
      <main className="flex flex-col gap-2 p-2">
        {/* Upper Half: Block Grid */}
        <div className="flex justify-center items-center items-center w-full">
          <BlockGrid
            selectedBlock={selectedBlock}
            onBlockSelect={setSelectedBlock}
            liveData={liveData}
          />
        </div>
        {/* Lower Half: Details Panel */}
        <DetailsPanel selectedBlock={selectedBlock} />
      </main>
    </>
  );
};

export default LiveDataPage;
