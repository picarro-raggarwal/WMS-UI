import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Boundary } from "../data/mock-data";

interface BoundaryFormProps<T extends Partial<Boundary> | Boundary> {
  mode: "add" | "edit";
  boundary: T;
  onBoundaryChange: (boundary: T) => void;
  onSave: () => void;
  onCancel: () => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
  onCoordinateChange: (index: number, field: "x" | "y", value: number) => void;
}

export const BoundaryForm = <T extends Partial<Boundary> | Boundary>({
  mode,
  boundary,
  onBoundaryChange,
  onSave,
  onCancel,
  onAddPoint,
  onRemovePoint,
  onCoordinateChange
}: BoundaryFormProps<T>) => {
  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit Boundary" : "Add New Boundary";
  const saveButtonText = isEditMode ? "Save Changes" : "Save Boundary";
  const nameInputId = isEditMode ? "edit-boundary-name" : "boundary-name";
  const typeInputId = isEditMode ? "edit-boundary-type" : "boundary-type";

  const canSave =
    boundary.name &&
    boundary.points &&
    boundary.points.length >= 3 &&
    !boundary.points.some((p) => !p.x || !p.y || p.x === 0 || p.y === 0);

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={nameInputId} className="block mb-2">
            Boundary Name
          </Label>
          <Input
            id={nameInputId}
            value={boundary.name || ""}
            onChange={(e) =>
              onBoundaryChange({
                ...boundary,
                name: e.target.value
              })
            }
            className="h-9"
            placeholder="Enter boundary name"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="block">Coordinates</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddPoint}
            >
              <Plus className="mr-2 w-3 h-3" />
              Add Point
            </Button>
          </div>

          {boundary.points?.map((point, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="X"
                value={point.x || ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    onCoordinateChange(index, "x", value);
                  }
                }}
                onWheelCapture={(e) => {
                  // Prevent scroll interference on number inputs
                  e.currentTarget.blur();
                }}
                onKeyDown={(e) => {
                  // Prevent scroll on arrow keys
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
                className={`flex-1 min-w-0 h-9 ${
                  !point.x || point.x === 0
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }`}
                required
              />

              <Input
                type="number"
                inputMode="decimal"
                placeholder="Y"
                value={point.y || ""}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? 0 : parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    onCoordinateChange(index, "y", value);
                  }
                }}
                onWheelCapture={(e) => {
                  // Prevent scroll interference on number inputs
                  e.currentTarget.blur();
                }}
                onKeyDown={(e) => {
                  // Prevent scroll on arrow keys
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
                className={`flex-1 min-w-0 h-9 ${
                  !point.y || point.y === 0
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }`}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemovePoint(index)}
                className="hover:bg-red-50 p-1 w-8 h-8 text-red-600 hover:text-red-700"
                title="Remove coordinate point"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={!canSave}
            className="flex-1"
          >
            {saveButtonText}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
