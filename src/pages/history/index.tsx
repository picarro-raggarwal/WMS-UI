import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const HistoryPage = () => {
  const [tab, setTab] = useState("tag");
  return (
    <div className="dark:bg-neutral-900 from-neutral-50 gradient-to-b to-white rounded-t-xl">
      <PageHeader />
      <main className="space-y-6 mx-auto px-8 md:px-12 py-8 w-full max-w-8xl">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="border-b border-neutral-200 w-full rounded-none p-2 flex items-center justify-start gap-2">
            <TabsTrigger value="tag">Tag History</TabsTrigger>
            <TabsTrigger value="room">Room History</TabsTrigger>
          </TabsList>
          <TabsContent value="tag">{/* <TagHistory /> */}</TabsContent>
          <TabsContent value="room">{/* <RoomHistory /> */}</TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HistoryPage;
