import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DateTimePicker24h } from "@/components/ui/date-time-picker-24hr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cylinder, Calendar, AlertCircle, Plus, X, Eye } from "lucide-react";
import {
  useGetRecentGasTanksQuery,
  useReplaceGasTankMutation,
  useGetGasTankTypesQuery,
  useGetGasTankConcentrationsQuery,
  RecentGasTank,
  NewGasTankReplacement,
  ConcentrationData,
  GasTankTypeConcentration,
  GasTankConcentration,
} from "@/pages/dashboard/data/gasTanks.slice";
import { format } from "date-fns";

type CustomConcentration = {
  id: string;
  name: string;
  unit: string;
  concentration: string;
};

type ReplacementFormData = {
  cylinder_id: string;
  production_number: string;
  tank_type: string;
  certification_date: string;
  expiration_date: string;
  blend_tolerance: string;
  analytical_accuracy: string;
  replace_technician: string;
  replaced_time: string;
  concentrations: Record<string, ConcentrationData>;
};

type ErrorData = {
  description?: string;
  message?: string;
  name?: string;
};

const GasTankRow = ({ tank }: { tank: RecentGasTank }) => {
  const [showConcentrationsDialog, setShowConcentrationsDialog] = useState(false);

  const {
    data: concentrationsData,
    isLoading: isLoadingConcentrations,
    error: concentrationsError,
  } = useGetGasTankConcentrationsQuery(tank.gas_tank_id, {
    skip: !showConcentrationsDialog,
  });

  const handleViewConcentrations = () => {
    setShowConcentrationsDialog(true);
  };

  const handleCloseConcentrationsDialog = () => {
    setShowConcentrationsDialog(false);
  };

  return (
    <>
      <TableRow className="hover:bg-gray-50">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <Cylinder className="w-4 h-4 text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 text-sm">{tank.cylinder_id}</div>
              <div className="hidden text-gray-500 text-sm">ID: {tank.gas_tank_id}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="text-gray-900 text-sm">{tank.production_number}</div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="text-xs">
            {tank.tank_type}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center text-gray-900 text-sm">
            <Calendar className="mr-1 w-4 h-4 text-gray-400" />
            {format(new Date(tank.certification_date), "MMM d, yyyy")}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center text-gray-900 text-sm">
            <Calendar className="mr-1 w-4 h-4 text-gray-400" />
            {format(new Date(tank.expiration_date), "MMM d, yyyy")}
          </div>
        </TableCell>
        <TableCell>
          <span className="font-medium text-gray-800 text-sm">
            {tank.active ? "Active" : "Inactive"}
          </span>
        </TableCell>
        <TableCell>
          <div className="text-gray-900 text-sm">{tank.replace_technician}</div>
        </TableCell>
        <TableCell>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleViewConcentrations}
            className="flex items-center gap-1 text-xs">
            View Concentrations
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={showConcentrationsDialog} onOpenChange={handleCloseConcentrationsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Gas Concentrations
              <br />
              {tank.cylinder_id} - {tank.tank_type}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {isLoadingConcentrations && (
              <div className="py-8 text-gray-500 text-center">Loading concentrations...</div>
            )}

            {concentrationsError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Failed to load concentrations data</AlertDescription>
              </Alert>
            )}

            {concentrationsData && concentrationsData.result.concentrations.length === 0 && (
              <div className="py-8 text-gray-500 text-center">
                No concentration data available for this tank
              </div>
            )}

            {concentrationsData && concentrationsData.result.concentrations.length > 0 && (
              <div className="space-y-3">
                <p className="mb-4 text-gray-600 text-sm">
                  Verified concentrations for this gas tank:
                </p>
                {concentrationsData.result.concentrations.map(
                  (conc: GasTankConcentration, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{conc.compound_name}</p>
                          <p className="text-gray-600 text-xs">Unit: {conc.concentration_unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-sm">
                            {conc.verified_concentration}
                          </p>
                          <p className="text-gray-600 text-xs">{conc.concentration_unit}</p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const GasCylinders = () => {
  const { data: recentTanks, isLoading, error, refetch } = useGetRecentGasTanksQuery(10);
  const { data: tankTypes } = useGetGasTankTypesQuery();
  const [replaceGasTank, { isLoading: isReplacing }] = useReplaceGasTankMutation();

  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [selectedTank, setSelectedTank] = useState<RecentGasTank | null>(null);
  const [formData, setFormData] = useState<ReplacementFormData>({
    cylinder_id: "",
    production_number: "",
    tank_type: "",
    certification_date: "",
    expiration_date: "",
    blend_tolerance: "",
    analytical_accuracy: "",
    replace_technician: "",
    replaced_time: "",
    concentrations: {},
  });
  const [concentrationValues, setConcentrationValues] = useState<Record<string, string>>({});
  const [customConcentrations, setCustomConcentrations] = useState<CustomConcentration[]>([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    if (formData.tank_type && tankTypes?.tank_types[formData.tank_type]) {
      const concentrationTypes = tankTypes.tank_types[formData.tank_type];
      const newConcentrationValues: Record<string, string> = {};
      const newConcentrations: Record<string, ConcentrationData> = {};

      concentrationTypes.forEach((conc: GasTankTypeConcentration) => {
        newConcentrationValues[conc.name] = conc.default_concentration.toString();
        newConcentrations[conc.name] = {
          concentration_unit: conc.unit,
          verified_concentration: conc.default_concentration,
        };
      });

      setConcentrationValues(newConcentrationValues);
      setFormData((prev) => ({ ...prev, concentrations: newConcentrations }));
      setCustomConcentrations([]);
    } else {
      setConcentrationValues({});
      setFormData((prev) => ({ ...prev, concentrations: {} }));
      if (formData.tank_type === "OTHER") {
        setCustomConcentrations([
          {
            id: Date.now().toString(),
            name: "",
            unit: "",
            concentration: "",
          },
        ]);
      } else {
        setCustomConcentrations([]);
      }
    }
  }, [formData.tank_type, tankTypes]);

  const handleReplaceClick = (tank?: RecentGasTank) => {
    if (tank) {
      setSelectedTank(tank);
      setFormData({
        cylinder_id: tank.cylinder_id,
        production_number: tank.production_number.toString(),
        tank_type: tank.tank_type,
        certification_date: format(new Date(tank.certification_date), "yyyy-MM-dd'T'HH:mm"),
        expiration_date: format(new Date(tank.expiration_date), "yyyy-MM-dd'T'HH:mm"),
        blend_tolerance: tank.blend_tolerance.toString(),
        analytical_accuracy: tank.analytical_accuracy.toString(),
        replace_technician: tank.replace_technician,
        replaced_time: "",
        concentrations: {},
      });
    } else {
      setSelectedTank(null);
      setFormData({
        cylinder_id: "",
        production_number: "",
        tank_type: "",
        certification_date: "",
        expiration_date: "",
        blend_tolerance: "",
        analytical_accuracy: "",
        replace_technician: "",
        replaced_time: "",
        concentrations: {},
      });
    }
    setConcentrationValues({});
    setCustomConcentrations([]);
    setFormError("");
    setFormSuccess("");
    setShowReplaceDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTankTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tank_type: value }));
  };

  const handleConcentrationChange = (concentrationName: string, value: string) => {
    setConcentrationValues((prev) => ({ ...prev, [concentrationName]: value }));

    const numericValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      concentrations: {
        ...prev.concentrations,
        [concentrationName]: {
          ...prev.concentrations[concentrationName],
          verified_concentration: numericValue,
        },
      },
    }));
  };

  const addCustomConcentration = () => {
    const newConcentration: CustomConcentration = {
      id: Date.now().toString(),
      name: "",
      unit: "",
      concentration: "",
    };
    setCustomConcentrations((prev) => [...prev, newConcentration]);
  };

  const removeCustomConcentration = (id: string) => {
    setCustomConcentrations((prev) => prev.filter((conc) => conc.id !== id));
    const concentrationToRemove = customConcentrations.find((conc) => conc.id === id);
    if (concentrationToRemove && concentrationToRemove.name) {
      setFormData((prev) => {
        const newConcentrations = { ...prev.concentrations };
        delete newConcentrations[concentrationToRemove.name];
        return { ...prev, concentrations: newConcentrations };
      });
    }
  };

  const handleCustomConcentrationChange = (
    id: string,
    field: keyof CustomConcentration,
    value: string
  ) => {
    setCustomConcentrations((prev) =>
      prev.map((conc) => (conc.id === id ? { ...conc, [field]: value } : conc))
    );

    const updatedConcentration = customConcentrations.find((conc) => conc.id === id);
    if (updatedConcentration) {
      const newConc = { ...updatedConcentration, [field]: value };
      if (newConc.name && newConc.unit && newConc.concentration) {
        setFormData((prev) => ({
          ...prev,
          concentrations: {
            ...prev.concentrations,
            [newConc.name]: {
              concentration_unit: newConc.unit,
              verified_concentration: parseFloat(newConc.concentration) || 0,
            },
          },
        }));
      }
    }
  };

  const formatDateForApi = (dateString: string): number => {
    if (!dateString) return 0;
    return Math.floor(new Date(dateString).getTime());
  };

  const handleSubmitReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.cylinder_id || !formData.production_number || !formData.tank_type) {
      setFormError("Cylinder ID, Production Number, and Tank Type are required");
      return;
    }

    if (tankTypes?.tank_types[formData.tank_type]) {
      const requiredConcentrations = tankTypes.tank_types[formData.tank_type];
      for (const conc of requiredConcentrations) {
        if (!concentrationValues[conc.name] || parseFloat(concentrationValues[conc.name]) <= 0) {
          setFormError(`${conc.name} concentration is required and must be greater than 0`);
          return;
        }
      }
    }

    if (formData.tank_type === "OTHER") {
      for (const customConc of customConcentrations) {
        if (customConc.name && customConc.unit && customConc.concentration) {
          if (parseFloat(customConc.concentration) <= 0) {
            setFormError(`${customConc.name} concentration must be greater than 0`);
            return;
          }
        } else if (customConc.name || customConc.unit || customConc.concentration) {
          setFormError(
            "Please complete all fields for custom concentrations or remove incomplete entries"
          );
          return;
        }
      }
    }

    try {
      const replacementData: NewGasTankReplacement = {
        cylinder_id: formData.cylinder_id,
        production_number: parseInt(formData.production_number, 10),
        tank_type: formData.tank_type,
        certification_date: formatDateForApi(formData.certification_date),
        expiration_date: formatDateForApi(formData.expiration_date),
        blend_tolerance: parseFloat(formData.blend_tolerance) || 0,
        analytical_accuracy: parseFloat(formData.analytical_accuracy) || 0,
        replace_technician: formData.replace_technician,
        concentrations: formData.concentrations,
      };

      await replaceGasTank(replacementData).unwrap();
      setFormSuccess("Gas tank replacement recorded successfully!");

      setTimeout(() => {
        setShowReplaceDialog(false);
        setFormSuccess("");
        refetch();
      }, 1500);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const serverData = (err as { data: unknown }).data;
        if (serverData && typeof serverData === "object" && "error" in serverData) {
          const errorData = serverData.error as ErrorData;
          if (errorData?.description) {
            setFormError(errorData.description);
          } else if (errorData?.message) {
            setFormError(errorData.message);
          } else {
            setFormError("Failed to record gas tank replacement. Please try again.");
          }
        } else {
          setFormError("Failed to record gas tank replacement. Please try again.");
        }
      } else {
        setFormError("Failed to record gas tank replacement. Please try again.");
      }
    }
  };

  if (isLoading) return <div className="p-4">Loading gas tanks...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading gas tanks</div>;

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <CardTitle className="flex justify-between items-center mb-2 mb-4 text-lg">
          <span>Gas Cylinder Reference Information</span>
          <Button
            size="sm"
            onClick={() => handleReplaceClick()}
            variant="outline"
            className="tracking-normal">
            Record Tank Replacement
          </Button>
        </CardTitle>
        <CardContent className="p-0">
          {recentTanks?.length === 0 ? (
            <div className="py-8 text-gray-500 text-center">No recent gas tanks found</div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Cylinder ID
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Production #
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Tank Type
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Certification
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Expiration
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Technician
                    </TableHead>
                    <TableHead className="font-medium text-gray-500 text-xs uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTanks?.map((tank) => (
                    <GasTankRow key={tank.gas_tank_id} tank={tank} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTank ? "Replace Gas Tank" : "Record New Gas Tank"}
              {selectedTank && (
                <>
                  <br />
                  <span className="text-primary-500">
                    {selectedTank.cylinder_id} - {selectedTank.tank_type}
                  </span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {formSuccess && (
            <div className="bg-green-50 mb-4 p-2 rounded-md text-green-600 text-sm">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmitReplacement}>
            <div className="space-y-6">
              <div className="gap-3 grid grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="cylinder_id">Cylinder ID</Label>
                  <Input
                    id="cylinder_id"
                    name="cylinder_id"
                    value={formData.cylinder_id}
                    onChange={handleInputChange}
                    required
                    placeholder="CC-123456"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="production_number">Production Number</Label>
                  <Input
                    id="production_number"
                    name="production_number"
                    type="number"
                    value={formData.production_number}
                    onChange={handleInputChange}
                    required
                    placeholder="12345"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <div className="flex flex-col space-y-1.5 mb-2">
                  <Label htmlFor="tank_type">Tank Type</Label>
                  <Select value={formData.tank_type} onValueChange={handleTankTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tank type" />
                    </SelectTrigger>
                    <SelectContent>
                      {tankTypes &&
                        Object.keys(tankTypes.tank_types).map((tankType) => (
                          <SelectItem key={tankType} value={tankType}>
                            {tankType}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.tank_type &&
                  tankTypes?.tank_types[formData.tank_type] &&
                  tankTypes.tank_types[formData.tank_type].length > 0 && (
                    <div className="bg-gray-50 p-4 border rounded-lg">
                      <div className="mb-3">
                        <p className="font-medium text-gray-900 text-sm">
                          Required Concentrations for {formData.tank_type}
                        </p>
                        <p className="mt-1 text-gray-600 text-xs">
                          Enter verified concentrations for each gas component
                        </p>
                      </div>
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                        {tankTypes.tank_types[formData.tank_type].map(
                          (conc: GasTankTypeConcentration) => (
                            <div key={conc.name} className="bg-white p-3 border rounded">
                              <Label htmlFor={`conc_${conc.name}`} className="font-medium text-sm">
                                {conc.name}
                              </Label>
                              <p className="mb-2 text-gray-500 text-xs">Unit: {conc.unit}</p>
                              <Input
                                id={`conc_${conc.name}`}
                                name={`conc_${conc.name}`}
                                type="number"
                                step="0.01"
                                value={concentrationValues[conc.name] || ""}
                                onChange={(e) =>
                                  handleConcentrationChange(conc.name, e.target.value)
                                }
                                required
                                placeholder={`Default: ${conc.default_concentration}`}
                                className="w-full"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {formData.tank_type === "OTHER" && (
                  <div className="bg-gray-50 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          Custom Gas Concentrations
                        </p>
                        <p className="mt-1 text-gray-600 text-xs">
                          Add the gas concentrations for this custom tank type
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={addCustomConcentration}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Add Gas
                      </Button>
                    </div>

                    {customConcentrations.length === 0 && (
                      <div className="py-4 text-gray-500 text-sm text-center">
                        No custom concentrations added yet. Click "Add Gas" to get started.
                      </div>
                    )}

                    <div className="space-y-3">
                      {customConcentrations.map((customConc) => (
                        <div key={customConc.id} className="bg-white p-3 border rounded">
                          <div className="flex justify-between items-center mb-2">
                            <Label className="font-medium text-sm">Gas Component</Label>
                            <Button
                              type="button"
                              onClick={() => removeCustomConcentration(customConc.id)}
                              size="sm"
                              variant="ghost"
                              className="p-0 w-6 h-6 text-red-500 hover:text-red-700">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="gap-2 grid grid-cols-3">
                            <div>
                              <Label
                                htmlFor={`custom_name_${customConc.id}`}
                                className="text-gray-600 text-xs">
                                Gas Name
                              </Label>
                              <Input
                                id={`custom_name_${customConc.id}`}
                                value={customConc.name}
                                onChange={(e) =>
                                  handleCustomConcentrationChange(
                                    customConc.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Methane"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`custom_unit_${customConc.id}`}
                                className="text-gray-600 text-xs">
                                Unit
                              </Label>
                              <Input
                                id={`custom_unit_${customConc.id}`}
                                value={customConc.unit}
                                onChange={(e) =>
                                  handleCustomConcentrationChange(
                                    customConc.id,
                                    "unit",
                                    e.target.value
                                  )
                                }
                                placeholder="ppm/ppb"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`custom_conc_${customConc.id}`}
                                className="text-gray-600 text-xs">
                                Concentration
                              </Label>
                              <Input
                                id={`custom_conc_${customConc.id}`}
                                type="number"
                                step="0.01"
                                value={customConc.concentration}
                                onChange={(e) =>
                                  handleCustomConcentrationChange(
                                    customConc.id,
                                    "concentration",
                                    e.target.value
                                  )
                                }
                                placeholder="0.00"
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-200" />

              <div className="gap-3 grid grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="certification_date">Certification Date</Label>
                  <DateTimePicker24h
                    id="certification_date"
                    name="certification_date"
                    type="datetime-local"
                    value={formData.certification_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expiration_date">Expiration Date</Label>
                  <DateTimePicker24h
                    id="expiration_date"
                    name="expiration_date"
                    type="datetime-local"
                    value={formData.expiration_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="gap-3 grid grid-cols-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="blend_tolerance">Blend Tolerance (%)</Label>
                  <Input
                    id="blend_tolerance"
                    name="blend_tolerance"
                    type="number"
                    step="0.1"
                    value={formData.blend_tolerance}
                    onChange={handleInputChange}
                    required
                    placeholder="20"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="analytical_accuracy">Analytical Accuracy (%)</Label>
                  <Input
                    id="analytical_accuracy"
                    name="analytical_accuracy"
                    type="number"
                    step="0.1"
                    value={formData.analytical_accuracy}
                    onChange={handleInputChange}
                    required
                    placeholder="10"
                  />
                </div>
              </div>

              <hr className="border-gray-200" />

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="replace_technician">Technician</Label>
                <Input
                  id="replace_technician"
                  name="replace_technician"
                  value={formData.replace_technician}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowReplaceDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isReplacing} className="flex-1">
                {isReplacing ? "Recording..." : "Record Replacement"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
