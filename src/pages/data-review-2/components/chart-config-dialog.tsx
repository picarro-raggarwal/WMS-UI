import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { mockPorts } from "../data/mock-data";

interface ChartConfigDialogProps {
  selectedPorts: string[];
  onPortsChange: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ChartConfigDialog = ({
  selectedPorts,
  onPortsChange
}: ChartConfigDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newSelectedPorts, setNewSelectedPorts] = useState<string[]>([]);

  useEffect(() => {
    setNewSelectedPorts(selectedPorts);
  }, [selectedPorts]);

  const handlePortToggle = (portId: string) => {
    if (newSelectedPorts.includes(portId)) {
      setNewSelectedPorts(newSelectedPorts.filter((id) => id !== portId));
    } else {
      const newPorts = [...newSelectedPorts, portId];
      if (newPorts.length > 4) {
        newPorts.shift();
      }
      setNewSelectedPorts(newPorts);
    }
  };

  const filteredPorts = mockPorts.filter(
    (port) =>
      port.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.number.toString().includes(searchQuery)
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="w-4 h-4" />
          Configure Charts
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-neutral-50 !p-0 max-w-4xl max-h-[80vh] overflow-y-auto thin-scrollbar-light">
        <DialogHeader className="top-0 sticky bg-white px-6 pt-6 pb-4 border-neutral-100 border-b">
          <DialogTitle>Configure Display Ports</DialogTitle>
          <div className="mb-4 pt-1 text-muted-foreground text-sm">
            Select up to 4 ports to display ({newSelectedPorts.length}/4
            selected)
          </div>
          <div className="relative mt-2">
            <Search className="top-[calc(50%-.5rem)] left-3 z-20 absolute w-4 h-4 text-neutral-500" />
            <Input
              placeholder="Search ports by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-6"
            />
          </div>
        </DialogHeader>

        <div className="px-6 pt-0 pb-8">
          <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPorts?.map((port) => (
              <div
                key={port.id}
                onClick={() => handlePortToggle(port.id)}
                className={`flex items-center space-x-3 bg-white hover:bg-muted/50 shadow-sm px-4 py-4 rounded-lg active:scale-[.98] transition-scale duration-100 cursor-pointer border ${
                  newSelectedPorts.includes(port.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <Checkbox
                  id={port.id}
                  checked={newSelectedPorts.includes(port.id)}
                  className="pointer-events-none"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2 pt-1">
                    <label className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed truncate">
                      Port #{port.number}
                    </label>
                    <p className="text-muted-foreground text-xs">{port.unit}</p>
                  </div>
                  <div className="mt-1">
                    <p className="text-muted-foreground text-xs truncate">
                      {port.label.split(" - ")[1] || port.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPorts.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground text-sm">
                No ports found matching your search
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="bottom-0 sticky flex justify-between bg-white px-6 py-4 border-neutral-100 border-t">
          <div>
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setNewSelectedPorts([])}
              disabled={newSelectedPorts.length === 0}
            >
              Clear All
            </Button>
            <DialogTrigger asChild>
              <Button
                variant="primary"
                onClick={() => {
                  onPortsChange(newSelectedPorts);
                }}
                disabled={newSelectedPorts.length === 0}
              >
                Apply ({newSelectedPorts.length})
              </Button>
            </DialogTrigger>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
