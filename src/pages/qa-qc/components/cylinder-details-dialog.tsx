import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Component {
  name: string;
  casNumber: string;
  requestedConc: string;
  qualifiedConc: string;
}

interface CylinderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cylinderId: string;
  components: Component[];
  blendTolerance: string;
  analyticalAccuracy: string;
}

export const CylinderDetailsDialog = ({
  open,
  onOpenChange,
  cylinderId,
  components,
  blendTolerance,
  analyticalAccuracy,
}: CylinderDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cylinder {cylinderId} Component Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Blend Tolerance</div>
              <div className="text-lg font-medium mt-1">{blendTolerance}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-muted-foreground">Analytical Accuracy</div>
              <div className="text-lg font-medium mt-1">{analyticalAccuracy}</div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>CAS Number</TableHead>
                <TableHead>Requested Conc.</TableHead>
                <TableHead>Qualified Conc.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((component) => (
                <TableRow key={component.casNumber}>
                  <TableCell>{component.name}</TableCell>
                  <TableCell>{component.casNumber}</TableCell>
                  <TableCell>{component.requestedConc}</TableCell>
                  <TableCell>{component.qualifiedConc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
