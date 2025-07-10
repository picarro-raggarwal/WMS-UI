import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  allCompounds,
  allExposures,
  allLocations,
  mockHistory
} from "./data/mock-data";

const TagHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompounds, setSelectedCompounds] = useState<string[]>([]);
  const [selectedExposures, setSelectedExposures] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const filteredHistory = useMemo(() => {
    return mockHistory.filter((row) => {
      if (
        searchTerm &&
        !row.tagId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !row.compound.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !row.location.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (
        selectedCompounds.length > 0 &&
        !selectedCompounds.includes(row.compound)
      ) {
        return false;
      }
      if (
        selectedExposures.length > 0 &&
        !selectedExposures.includes(row.exposure)
      ) {
        return false;
      }
      if (
        selectedLocations.length > 0 &&
        !selectedLocations.includes(row.location)
      ) {
        return false;
      }
      return true;
    });
  }, [searchTerm, selectedCompounds, selectedExposures, selectedLocations]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCompounds([]);
    setSelectedExposures([]);
    setSelectedLocations([]);
  };

  return (
    <div>
      <div className="relative inset-px bg-white dark:bg-neutral-800 shadow-black/5 shadow-lg dark:shadow-none dark:border dark:border-neutral-700/20 rounded-xl ring-1 ring-black/5 text-neutral-950 dark:text-neutral-50">
        <div className="flex justify-between items-center gap-6 p-4 border-neutral-200 border-b">
          <div className="flex-1 min-w-[300px] max-w-[400px]">
            <Input
              placeholder="Search by Tag Id, Compound, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              size="sm"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Compound Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`min-w-[100px] justify-between ${
                    selectedCompounds.length > 0
                      ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : ""
                  }`}
                >
                  Compound
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Select Compounds</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allCompounds.map((compound) => (
                  <DropdownMenuItem
                    key={compound}
                    className="flex items-center space-x-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setSelectedCompounds((prev) =>
                        prev.includes(compound)
                          ? prev.filter((c) => c !== compound)
                          : [...prev, compound]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedCompounds.includes(compound)}
                      onCheckedChange={() =>
                        setSelectedCompounds((prev) =>
                          prev.includes(compound)
                            ? prev.filter((c) => c !== compound)
                            : [...prev, compound]
                        )
                      }
                    />
                    <span>{compound}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Exposure Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`min-w-[100px] justify-between ${
                    selectedExposures.length > 0
                      ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : ""
                  }`}
                >
                  Exposure
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Select Exposure Levels</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allExposures.map((exposure) => (
                  <DropdownMenuItem
                    key={exposure}
                    className="flex items-center space-x-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setSelectedExposures((prev) =>
                        prev.includes(exposure)
                          ? prev.filter((x) => x !== exposure)
                          : [...prev, exposure]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedExposures.includes(exposure)}
                      onCheckedChange={() =>
                        setSelectedExposures((prev) =>
                          prev.includes(exposure)
                            ? prev.filter((x) => x !== exposure)
                            : [...prev, exposure]
                        )
                      }
                    />
                    <span>{exposure}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Location Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={`min-w-[100px] justify-between ${
                    selectedLocations.length > 0
                      ? "border-primary-500 bg-primary-50 text-primary-700 hover:bg-primary-100"
                      : ""
                  }`}
                >
                  Location
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Select Locations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allLocations.map((location) => (
                  <DropdownMenuItem
                    key={location}
                    className="flex items-center space-x-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      setSelectedLocations((prev) =>
                        prev.includes(location)
                          ? prev.filter((l) => l !== location)
                          : [...prev, location]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() =>
                        setSelectedLocations((prev) =>
                          prev.includes(location)
                            ? prev.filter((l) => l !== location)
                            : [...prev, location]
                        )
                      }
                    />
                    <span>{location}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Active Filters Row */}
        {(searchTerm ||
          selectedCompounds.length > 0 ||
          selectedExposures.length > 0 ||
          selectedLocations.length > 0) && (
          <div className="px-4 py-3 border-neutral-200">
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-neutral-600 text-sm">
                  Active filters:
                </span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchTerm}"
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {selectedCompounds.map((compound) => (
                  <Badge key={compound} variant="secondary" className="gap-1">
                    Compound: {compound}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() =>
                        setSelectedCompounds((prev) =>
                          prev.filter((c) => c !== compound)
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {selectedExposures.map((exposure) => (
                  <Badge key={exposure} variant="secondary" className="gap-1">
                    Exposure: {exposure}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() =>
                        setSelectedExposures((prev) =>
                          prev.filter((x) => x !== exposure)
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                {selectedLocations.map((location) => (
                  <Badge key={location} variant="secondary" className="gap-1">
                    Location: {location}
                    <Button
                      variant="ghost"
                      size="xs"
                      className="hover:bg-transparent p-0 h-auto"
                      onClick={() =>
                        setSelectedLocations((prev) =>
                          prev.filter((l) => l !== location)
                        )
                      }
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="shrink-0"
              >
                <X className="mr-1 w-4 h-4" /> Clear All
              </Button>
            </div>
          </div>
        )}
        {/* Table */}
        <Card className="bg-transparent !shadow-none !border-none rounded-none !ring-0">
          <div className="relative inset-px flex flex-col bg-white dark:bg-neutral-800 shadow-black/5 shadow-xl dark:shadow-none p-6 dark:border dark:border-neutral-700/20 rounded-xl ring-1 ring-black/5 h-full text-neutral-950 dark:text-neutral-50">
            <Table className="border-separate border-spacing-y-0.5">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-none">
                  <TableHead className="w-[100px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Tag Id
                  </TableHead>
                  <TableHead className="w-[120px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Concentration
                  </TableHead>
                  <TableHead className="w-[120px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Compound
                  </TableHead>
                  <TableHead className="w-[140px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    24 hrs avg conc.
                  </TableHead>
                  <TableHead className="w-[140px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Exposure level
                  </TableHead>
                  <TableHead className="w-[160px] font-medium text-gray-500 text-xs uppercase tracking-wider">
                    Current location
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-neutral-400 text-center"
                    >
                      No data found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((row, idx) => (
                    <TableRow
                      key={row.tagId + idx}
                      className={idx % 2 === 0 ? "bg-neutral-100" : "bg-white"}
                    >
                      <TableCell className="px-4 py-3 rounded-l-lg font-mono text-xs">
                        {row.tagId}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {Number(row.concentration)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {row.compound}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {Number(row.avg24hr)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {row.exposure}
                      </TableCell>
                      <TableCell className="px-4 py-3 rounded-r-lg">
                        {row.location}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TagHistory;
