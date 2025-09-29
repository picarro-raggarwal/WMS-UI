import { SocketDebugger } from "@/components/SocketDebugger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemInfo } from "@/context/DataContext";
import {
  AlertCircle,
  BarChart4,
  Cpu,
  HardDrive,
  Layers,
  Plug,
  RefreshCw,
  Settings,
  Shield,
  Terminal
} from "lucide-react";
import { useState } from "react";
import SetupView from "./components/setup-view";

const ServicePage = () => {
  const { name } = useSystemInfo();
  const [setupViewOn, setSetupViewOn] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState(
    "Workplace Monitoring System Terminal v1.0.0\n> _"
  );
  const [terminalInput, setTerminalInput] = useState("");

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset the system? This will clear all data."
      )
    ) {
      localStorage.removeItem("fenceline_data");
      localStorage.removeItem("theme");
      localStorage.removeItem("font");
      window.location.reload();
    }
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    const command = terminalInput.trim();
    if (!command) return;

    let response = "";

    if (command === "help") {
      response =
        "Available commands:\nhelp - Show this help\nclear - Clear terminal\nstatus - Show system status\nversion - Show system version";
    } else if (command === "clear") {
      setTerminalOutput("Workplace Monitoring System Terminal v1.0.0\n> _");
      setTerminalInput("");
      return;
    } else if (command === "status") {
      response =
        "System status: Online\nCPU: 12%\nMemory: 34%\nStorage: 56%\nNetwork: Connected";
    } else if (command === "version") {
      response = "Workplace Monitoring System v1.0.0\nBuild: 20240301-alpha";
    } else {
      response = `Command not found: ${command}`;
    }

    setTerminalOutput(
      (prev) => `${prev.replace("> _", "")}> ${command}\n${response}\n> _`
    );
    setTerminalInput("");
  };

  if (setupViewOn) {
    return <SetupView />;
  }

  const tabClasnames =
    "px-4 flex items-center justify-start gap-2 data-[state=active]:bg-white neutral-100 dark:data-[state=active]:bg-neutral-800 h-12 rounded-xl ";

  return (
    <>
      <PageHeader pageName="Service" />

      <div className="mx-auto px-8 md:px-12 py-8 w-full max-w-8xl">
        <Tabs defaultValue="socketdebugger" className="flex items-start gap-8">
          <TabsList className="flex flex-col items-stretch !bg-transparent p-0 w-[200px] h-auto">
            <TabsTrigger value="socketdebugger" className={tabClasnames}>
              <Plug size={16} />
              <span>Socket Debugger</span>
            </TabsTrigger>
            <TabsTrigger value="peripherals" className={tabClasnames}>
              <HardDrive size={16} />
              <span>Peripherals</span>
            </TabsTrigger>
            <TabsTrigger value="serial" className={tabClasnames}>
              {" "}
              <Layers size={16} />
              <span>Serial Numbers</span>
            </TabsTrigger>
            <TabsTrigger value="terminal" className={tabClasnames}>
              {" "}
              <Terminal size={16} />
              <span>Terminal</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className={tabClasnames}>
              {" "}
              <BarChart4 size={16} />
              <span>Testing</span>
            </TabsTrigger>
            <TabsTrigger value="root" className={tabClasnames}>
              {" "}
              <Shield size={16} />
              <span>Root Access</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="socketdebugger"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <SocketDebugger />
          </TabsContent>
          <TabsContent
            value="peripherals"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <Card className="p-6 w-full">
              <h2 className="mb-4 font-medium text-lg">
                Peripheral Configuration
              </h2>
              <div className="gap-6 grid grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium text-md">Sensors</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>TVOC Sensor</span>
                      </div>
                      <span className="font-medium text-primary-500 dark:text-primary-400 text-sm">
                        Connected
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>EtO Sensor</span>
                      </div>
                      <span className="font-medium text-primary-500 dark:text-primary-400 text-sm">
                        Connected
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>Wind Sensor</span>
                      </div>
                      <span className="font-medium text-primary-500 dark:text-primary-400 text-sm">
                        Connected
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>Pressure Sensor</span>
                      </div>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400 text-sm">
                        Needs Calibration
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-md">Modules</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>UPS Module</span>
                      </div>
                      <span className="font-medium text-primary-500 dark:text-primary-400 text-sm">
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>Network Module</span>
                      </div>
                      <span className="font-medium text-primary-500 dark:text-primary-400 text-sm">
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>Storage Module</span>
                      </div>
                      <span className="font-medium text-primary-500 dark:text-primary-400 text-sm">
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>Gas Cylinder Module</span>
                      </div>
                      <span className="font-medium text-primary-500 dark:text-primary-400 text-sm">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  className="flex items-center gap-2"
                  icon={<RefreshCw />}
                  variant="outline"
                >
                  Refresh Peripherals
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="serial" className="flex-1 space-y-6 mt-0 w-full">
            <Card className="p-6">
              <h2 className="mb-4 font-medium text-lg">
                Component Serial Numbers
              </h2>
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      <th className="py-2 font-medium text-left">Component</th>
                      <th className="py-2 font-medium text-left">
                        Serial Number
                      </th>
                      <th className="py-2 font-medium text-left">
                        Manufacture Date
                      </th>
                      <th className="py-2 font-medium text-left">
                        Last Calibration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      <td className="py-3">Main System</td>
                      <td className="py-3 font-mono text-sm">
                        FLS-2023-0001-A
                      </td>
                      <td className="py-3">2023-06-15</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      <td className="py-3">TVOC Sensor</td>
                      <td className="py-3 font-mono text-sm">
                        SNS-TVOC-2023-0042
                      </td>
                      <td className="py-3">2023-05-22</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      <td className="py-3">EtO Sensor</td>
                      <td className="py-3 font-mono text-sm">
                        SNS-ETO-2023-0036
                      </td>
                      <td className="py-3">2023-05-20</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      <td className="py-3">Wind Sensor</td>
                      <td className="py-3 font-mono text-sm">
                        SNS-WIND-2023-0028
                      </td>
                      <td className="py-3">2023-04-18</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      <td className="py-3">Pressure Sensor</td>
                      <td className="py-3 font-mono text-sm">
                        SNS-PRES-2023-0051
                      </td>
                      <td className="py-3">2023-06-02</td>
                      <td className="py-3 text-yellow-600 dark:text-yellow-400">
                        Needs Calibration
                      </td>
                    </tr>
                    <tr className="border-neutral-200 dark:border-neutral-700 border-b">
                      <td className="py-3">UPS Module</td>
                      <td className="py-3 font-mono text-sm">
                        UPS-2023-0018-B
                      </td>
                      <td className="py-3">2023-03-30</td>
                      <td className="py-3">N/A</td>
                    </tr>
                    <tr>
                      <td className="py-3">Gas Cylinder 1</td>
                      <td className="py-3 font-mono text-sm">GC-2023-0103</td>
                      <td className="py-3">2023-09-12</td>
                      <td className="py-3">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent
            value="terminal"
            className="flex-1 space-y-6 mt-0 w-full"
          >
            <Card className="p-6">
              <h2 className="mb-4 font-medium text-lg">System Terminal</h2>
              <div className="bg-black mb-4 p-4 rounded-lg h-80 overflow-y-auto font-mono text-primary-400 text-sm whitespace-pre-wrap">
                {terminalOutput}
              </div>
              <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                <Input
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="font-mono"
                  placeholder="Enter command (try 'help')"
                />
                <Button type="submit">Execute</Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="flex-1 space-y-6 mt-0 w-full">
            <Card className="p-6">
              <h2 className="mb-4 font-medium text-lg">Testing Applications</h2>
              <div className="gap-6 grid grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium text-md">Diagnostic Tests</h3>
                  <div className="gap-4 grid grid-cols-1">
                    <Button
                      variant="outline"
                      className="justify-start w-full"
                      icon={<Cpu size={18} />}
                    >
                      Run Sensor Diagnostics
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start w-full"
                      icon={<HardDrive size={18} />}
                    >
                      Test Storage Integrity
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start w-full"
                      icon={<Settings size={18} />}
                    >
                      Calibrate Pressure Sensor
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start w-full"
                      icon={<AlertCircle size={18} />}
                    >
                      Test Alert System
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Root Access Tab */}
          <TabsContent value="root" className="flex-1 space-y-6 mt-0 w-full">
            <Card className="p-6">
              <h2 className="mb-4 font-medium text-lg">
                Root Level Configuration
              </h2>
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This section provides access to critical system
                  configurations, which may affect system stability and
                  measurement accuracy. Proceed with caution.
                </AlertDescription>
              </Alert>

              <div className="gap-6 grid grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium text-md">System Configuration</h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-sm">Network Configuration</label>
                      <Input defaultValue="192.168.1.100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">Subnet Mask</label>
                      <Input defaultValue="255.255.255.0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">Gateway</label>
                      <Input defaultValue="192.168.1.1" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">DNS Servers</label>
                      <Input defaultValue="8.8.8.8, 8.8.4.4" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-md">Advanced Settings</h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-sm">
                        Measurement Interval (seconds)
                      </label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">
                        Data Retention Period (days)
                      </label>
                      <Input type="number" defaultValue="90" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">Remote Access</label>
                      <select className="bg-white dark:bg-neutral-900 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md w-full h-10">
                        <option>Disabled</option>
                        <option>SSH Only</option>
                        <option>Full Access</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">Log Level</label>
                      <select className="bg-white dark:bg-neutral-900 px-3 border border-neutral-200 dark:border-neutral-700 rounded-md w-full h-10">
                        <option>Error</option>
                        <option>Warning</option>
                        <option selected>Info</option>
                        <option>Debug</option>
                        <option>Trace</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={() => setSetupViewOn(true)}
                  variant="outline"
                  icon={<Settings />}
                >
                  {" "}
                  Setup Wizard
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  icon={<AlertCircle />}
                  className="hover:bg-red-600 dark:hover:bg-red-700"
                >
                  Reset System
                </Button>
                <div className="flex-1" />
                <Button variant="outline">Reset to Defaults</Button>
                <Button variant="default">Apply Changes</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ServicePage;
