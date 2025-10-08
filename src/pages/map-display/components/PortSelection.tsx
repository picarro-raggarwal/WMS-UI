import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from "@/components/ui/card";
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardDescription>
          Select a port and click on any boundary to place it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Available Ports ({availablePorts.length})
          </label>
          <Select
            value={selectedPort?.id || ""}
            onValueChange={(portId) => {
              const port = availablePorts.find((p) => p.id === portId);
              if (port) onPortSelect(port);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a port to place..." />
            </SelectTrigger>
            <SelectContent className="w-full">
              {availablePorts.map((port) => (
                <SelectItem
                  key={port.id}
                  value={port.id}
                  className="cursor-pointer w-full"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Port #{port.portNumber}
                      </span>
                      <span className="text-xs text-gray-500">{port.name}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Bank {port.bankNumber}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
              {availablePorts.length === 0 && (
                <SelectItem value="no-ports" disabled>
                  <span className="text-gray-500 italic">
                    All ports have been placed
                  </span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedPort && (
          <div className="mt-2 mb-4 text-neutral-500 dark:text-neutral-400 text-xs">
            💡 Click on any boundary to place this port
          </div>
        )}
      </CardContent>
    </Card>
  );
};
