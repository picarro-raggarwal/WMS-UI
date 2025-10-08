import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Port } from "@/types/common/ports";

interface PortSelectionComponentProps {
  availablePorts: Port[];
  selectedPort: Port | null;
  onPortSelect: (port: Port) => void;
}

export const PortSelectionComponent = ({
  availablePorts,
  selectedPort,
  onPortSelect
}: PortSelectionComponentProps) => {
  return (
    <div className="space-y-3">
      <div className="text-xs text-neutral-600 dark:text-neutral-400">
        {availablePorts.length === 0
          ? "⚠️ All ports have been placed"
          : "💡 Select port → Click on boundary to place"}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Available Ports ({availablePorts.length})
        </label>
        <Select
          value={selectedPort?.id || ""}
          onValueChange={(portId) => {
            const port = availablePorts.find((p) => p.id === portId);
            if (port) onPortSelect(port);
          }}
        >
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Choose a port to place..." />
          </SelectTrigger>
          <SelectContent className="w-full">
            {availablePorts.map((port) => (
              <SelectItem
                key={port.id}
                value={port.id}
                className="cursor-pointer w-full"
              >
                <div className="flex w-full items-center gap-4">
                  {/* Dark Circular Badge */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800/90 text-xs font-bold text-white">
                    {port.portNumber}
                  </div>

                  {/* Text Information */}
                  <div className="flex flex-1 flex-col items-start">
                    {/* Title Line */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {/* Port #{port.portNumber} - {port.name} */}
                        {port.name}
                      </span>
                    </div>

                    {/* Bank Information */}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Bank {port.bankNumber}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
            {availablePorts.length === 0 && (
              <SelectItem value="no-ports" disabled className="py-3">
                <div className="flex w-full items-center justify-center py-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                    All ports have been placed
                  </span>
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
