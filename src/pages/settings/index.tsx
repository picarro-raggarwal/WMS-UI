import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetSystemInfoQuery } from "@/lib/services/systemInfo.slice";
// import { useGetTimeQuery } from "@/lib/services/timesync.slice";
import { convertTimestampToTimezone } from "@/lib/utils";
import { formatDateTime } from "@/utils";
import { useLocalStorage } from "@mantine/hooks";
import {
  AlertTriangle,
  Info,
  Monitor,
  Moon,
  PanelLeft,
  Settings2,
  Sun,
  Type,
  User2
} from "lucide-react";
import { useEffect, useState } from "react";
import { GasCylinders } from "../qa-qc/components/gas-cylinders";
import { GeneralTab } from "./components/general-tab";
import { PortConfigurationTab } from "./components/port-configuration-tab";
import { SmartRecipeTab } from "./components/smart-recipe-tab";
import { SpeciesThresholdTab } from "./components/species-threshold-tab";
import { ThresholdsTab } from "./components/thresholds-tab";
import { UsersTab } from "./components/users-tab";

const SettingsPage = ({ noTitle }: { noTitle?: boolean }) => {
  const [isDarkMode, setIsDarkMode] = useLocalStorage({
    key: "theme",
    defaultValue: false,
    serialize: (value) => (value ? "dark" : "light"),
    deserialize: (value) => value === "dark"
  });

  const [isBarlowFont, setIsBarlowFont] = useLocalStorage({
    key: "font",
    defaultValue: false,
    serialize: (value) => (value ? "barlow" : "default"),
    deserialize: (value) => value === "barlow"
  });

  const [is24HourFormat] = useLocalStorage({
    key: "timeFormat",
    defaultValue: false,
    serialize: (value) => (value ? "24hour" : "12hour"),
    deserialize: (value) => value === "24hour"
  });

  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage({
    key: "sidebar:state",
    defaultValue: true
  });

  const { data: systemInfo, isLoading: isSystemInfoLoading } =
    useGetSystemInfoQuery();

  // const { data: timeData } = useGetTimeQuery();

  const [currentTime, setCurrentTime] = useState<{
    epoch: number;
    timezone: string;
  } | null>(null);

  const [browserTime, setBrowserTime] = useState(new Date());

  // useEffect(() => {
  //   if (timeData?.epoch && timeData?.timezone) {
  //     setCurrentTime({
  //       epoch: timeData.epoch,
  //       timezone: timeData.timezone
  //     });
  //   }
  // }, [timeData]);

  // Increment local time every 5 seconds (reduced from 1 second)
  useEffect(() => {
    if (!currentTime) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) =>
        prev
          ? {
              ...prev,
              epoch: prev.epoch + 1
            }
          : null
      );
    }, 5000); // Changed from 1000ms to 5000ms

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime?.timezone]);

  // Update browser time every 5 seconds (reduced from 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      setBrowserTime(new Date());
    }, 5000); // Changed from 1000ms to 5000ms

    return () => clearInterval(interval);
  }, []);

  const uiVersion = import.meta.env.VITE_UI_VERSION || "dev";

  // Format current time
  const currentTimeFormatted =
    currentTime?.epoch && currentTime?.timezone
      ? convertTimestampToTimezone(
          currentTime.epoch,
          currentTime.timezone,
          is24HourFormat
            ? "MMM dd, yyyy • HH:mm:ss"
            : "MMM dd, yyyy • hh:mm:ss a"
        )
      : null;

  useEffect(() => {
    if (import.meta.env.VITE_UI_VERSION !== "dev") {
      return;
    } else {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      if (isBarlowFont) {
        document.documentElement.classList.add("font-barlow");
      } else {
        document.documentElement.classList.remove("font-barlow");
      }
    }
  }, [isDarkMode, isBarlowFont]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleFont = () => {
    setIsBarlowFont(!isBarlowFont);
  };

  // const toggleTimeFormat = () => {
  //   setIs24HourFormat(!is24HourFormat);
  // };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const tabClasnames =
    "px-4 flex items-center justify-start gap-2 data-[state=active]:bg-white neutral-100 dark:data-[state=active]:bg-neutral-800 h-12 rounded-xl ";

  return (
    <>
      {!noTitle && <PageHeader pageName="System Settings" />}

      <div className="mx-auto px-8 md:px-12 py-8 w-full max-w-8xl">
        <Tabs defaultValue="info" className="flex items-start gap-8">
          <TabsList className="flex flex-col items-stretch !bg-transparent p-0 w-[200px] h-auto">
            <TabsTrigger value="info" className={tabClasnames}>
              <Info size={16} />
              <span>System Info</span>
            </TabsTrigger>
            {/* <TabsTrigger value="general" className={tabClasnames}>
              <Settings2 size={16} />
              <span>General Settings</span>
            </TabsTrigger> */}

            {/* <TabsTrigger value="thresholds" className={tabClasnames}>
              <AlertTriangle size={16} />
              <span>Alarm Thresholds</span>
            </TabsTrigger> */}
            <TabsTrigger value="display" className={tabClasnames}>
              <Monitor size={16} />
              <span>Display Settings</span>
            </TabsTrigger>
            {/* <TabsTrigger value="gas-cylinders" className={tabClasnames}>
              <Cylinder size={16} />
              <span>Gas Tanks</span>
            </TabsTrigger> */}
            <TabsTrigger value="port-config" className={tabClasnames}>
              <Settings2 size={16} />
              <span>Port Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="species-threshold" className={tabClasnames}>
              <AlertTriangle size={16} />
              <span>Species Threshold</span>
            </TabsTrigger>
            <TabsTrigger value="smart-recipe" className={tabClasnames}>
              <Settings2 size={16} />
              <span>Smart Recipe</span>
            </TabsTrigger>
            <TabsTrigger value="user-management" className={tabClasnames}>
              <User2 size={16} />
              <span>User Management</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="thresholds"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <ThresholdsTab />
          </TabsContent>

          <TabsContent
            value="gas-cylinders"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <GasCylinders />
          </TabsContent>

          <TabsContent
            value="port-config"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <PortConfigurationTab />
          </TabsContent>

          <TabsContent
            value="species-threshold"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <SpeciesThresholdTab />
          </TabsContent>

          <TabsContent
            value="smart-recipe"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <SmartRecipeTab />
          </TabsContent>

          <TabsContent value="info" className="flex-1 space-y-6 mt-0 w-full">
            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-neutral-50 dark:from-neutral-900 to-neutral-200 dark:to-neutral-800 p-8 border-neutral-200 dark:border-neutral-700">
                {isSystemInfoLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-neutral-500">
                      Loading system information...
                    </div>
                  </div>
                ) : systemInfo ? (
                  <div className="flex items-start gap-8">
                    {/* Device Graphic */}
                    <div className="relative flex-shrink-0 -my-6">
                      <img
                        src="/fenceline_icon_d.png"
                        alt="Device"
                        className="hidden dark:block w-32 h-40 object-fill"
                      />
                      <img
                        src="/fenceline_icon.png"
                        alt="Device"
                        className="dark:hidden block w-32 h-40 object-fill"
                      />
                    </div>

                    {/* System Details */}
                    <div className="flex-1 space-y-6">
                      <div>
                        <h1 className="mb-2 font-bold text-neutral-900 dark:text-neutral-100 text-2xl">
                          {systemInfo.model}
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                          {systemInfo.serial_number}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium text-sm">
                          Version {systemInfo.version}
                        </div>
                        <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                          {systemInfo.analyzer_count} Analyzer
                          {systemInfo.analyzer_count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-neutral-500 text-center">
                    Failed to load system information
                  </div>
                )}
              </Card>

              {/* Technical Specifications */}
              <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
                {/* System Specifications */}
                <Card className="p-6">
                  <h3 className="mb-6 font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                    System Specifications
                  </h3>
                  {systemInfo && (
                    <div>
                      <div className="flex justify-between items-center py-4 border-neutral-200 dark:border-neutral-700 border-b last:border-b-0">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Model
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {systemInfo.model}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-neutral-200 dark:border-neutral-700 border-b last:border-b-0">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Serial Number
                        </span>
                        <span className="text-neutral-900 dark:text-neutral-100">
                          {systemInfo.serial_number}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-neutral-200 dark:border-neutral-700 border-b last:border-b-0">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Software Version
                        </span>
                        {systemInfo.version}
                      </div>
                      <div className="flex justify-between items-center py-4 border-neutral-200 dark:border-neutral-700 border-b last:border-b-0">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          UI Build
                        </span>
                        <span className="text-neutral-900 dark:text-neutral-100">
                          {uiVersion}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-neutral-200 dark:border-neutral-700 border-b last:border-b-0">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          System Time
                        </span>
                        <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                          {currentTimeFormatted || "Loading..."}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-neutral-200 dark:border-neutral-700 border-b last:border-b-0">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Local Time
                        </span>
                        <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                          {formatDateTime(browserTime)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-neutral-200 dark:border-neutral-700 border-b last:border-b-0">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Time Zone
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {Intl.DateTimeFormat().resolvedOptions().timeZone}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="mb-6 font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                    Analyzer Information
                  </h3>
                  {systemInfo?.analyzers?.length ? (
                    <div className="space-y-6">
                      {systemInfo.analyzers.map((analyzer, index) => (
                        <div
                          key={index}
                          className="space-y-4 bg-neutral-50 dark:bg-neutral-700/30 p-4 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-700"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {analyzer.model}
                              </h4>
                              <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-sm">
                                {analyzer.serial_number}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              Analyzer {index + 1}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-600 dark:text-neutral-400">
                                Hardware Version
                              </span>
                              <span className="text-neutral-700 dark:text-neutral-300">
                                {analyzer.hw_version || "Not specified"}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-neutral-600 dark:text-neutral-400">
                                Software Version
                              </span>
                              <Badge variant="outline" className="text-sm">
                                {analyzer.sw_version}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-neutral-500 text-center">
                      No analyzers configured
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="flex-1 space-y-6 mt-0 w-full">
            <Card className="space-y-6 p-6">
              <div className="mb-6">
                <CardTitle className="mb-2 text-lg">Display Settings</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Configure the display settings for the system.
                </p>
              </div>
              <div className="space-y-8">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="font-medium text-neutral-600 dark:text-neutral-300 text-sm">
                      System Name
                    </label>
                    <Input
                      value={systemInfo?.model || "Fenceline System"}
                      readOnly
                      className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
                    />
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                      Appearance
                    </h3>
                  </div>
                  {import.meta.env.VITE_UI_VERSION === "dev" && (
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        {isDarkMode ? (
                          <Moon
                            size={20}
                            className="text-neutral-700 dark:text-neutral-300"
                          />
                        ) : (
                          <Sun
                            size={20}
                            className="text-neutral-700 dark:text-neutral-300"
                          />
                        )}
                        <span className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
                          <span className="flex items-center gap-1">
                            Dark Mode{" "}
                            <div className="bg-primary-500 px-1 rounded-md text-[10px] text-white">
                              BETA
                            </div>
                          </span>
                          <span className="block text-neutral-500 dark:text-neutral-400 text-xs">
                            Switch to dark color scheme
                          </span>
                        </span>
                      </div>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                  )}
                  {import.meta.env.VITE_UI_VERSION === "dev" && (
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Type
                          size={20}
                          className="text-neutral-700 dark:text-neutral-300"
                        />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
                          Blendr Font
                          <span className="block text-neutral-500 dark:text-neutral-400 text-xs">
                            Use custom Blendr typography
                          </span>
                        </span>
                      </div>
                      <Switch
                        checked={isBarlowFont}
                        onCheckedChange={toggleFont}
                      />
                    </div>
                  )}

                  {/* <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock
                        size={20}
                        className="text-neutral-700 dark:text-neutral-300"
                      />
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
                        24-Hour Time Format
                        <span className="block text-neutral-500 dark:text-neutral-400 text-xs">
                          Display time in 24-hour format
                        </span>
                      </span>
                    </div>
                    <Switch checked={is24HourFormat} onCheckedChange={toggleTimeFormat} />
                  </div> */}

                  <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <PanelLeft
                        size={20}
                        className="text-neutral-700 dark:text-neutral-300"
                      />
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
                        Keep Sidebar Minimized
                        <span className="block text-neutral-500 dark:text-neutral-400 text-xs">
                          Start with sidebar collapsed by default
                        </span>
                      </span>
                    </div>
                    <Switch
                      checked={!isSidebarOpen}
                      onCheckedChange={() => toggleSidebar()}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="flex-1 space-y-6 mt-0 w-full">
            <GeneralTab />
          </TabsContent>

          <TabsContent
            value="user-management"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <UsersTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsPage;
