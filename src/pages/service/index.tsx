import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSystemInfo } from "@/context/DataContext";
import SetupView from "./components/setup-view";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Terminal,
  Cpu,
  HardDrive,
  Layers,
  Shield,
  BarChart4,
  RefreshCw,
  AlertCircle,
  Plug,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { SocketDebugger } from "@/components/SocketDebugger";

const ServicePage = () => {
  const { name } = useSystemInfo();
  const [setupViewOn, setSetupViewOn] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("Fenceline System Terminal v1.0.0\n> _");
  const [terminalInput, setTerminalInput] = useState("");

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the system? This will clear all data.")) {
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
      setTerminalOutput("Fenceline System Terminal v1.0.0\n> _");
      setTerminalInput("");
      return;
    } else if (command === "status") {
      response = "System status: Online\nCPU: 12%\nMemory: 34%\nStorage: 56%\nNetwork: Connected";
    } else if (command === "version") {
      response = "Fenceline System v1.0.0\nBuild: 20240301-alpha";
    } else {
      response = `Command not found: ${command}`;
    }

    setTerminalOutput((prev) => `${prev.replace("> _", "")}> ${command}\n${response}\n> _`);
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

      <div className="mx-auto max-w-8xl py-8 w-full px-8 md:px-12">
        <Tabs defaultValue="socketdebugger" className="flex items-start gap-8">
          <TabsList className="items-stretch h-auto flex flex-col !bg-transparent p-0 w-[200px] ">
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

          <TabsContent value="socketdebugger" className="space-y-6 w-full flex-1 mt-0">
            <SocketDebugger />
          </TabsContent>
          <TabsContent value="peripherals" className="space-y-6 w-full flex-1 mt-0">
            <Card className="p-6 w-full">
              <h2 className="text-lg font-medium mb-4">Peripheral Configuration</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Sensors</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>TVOC Sensor</span>
                      </div>
                      <span className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>EtO Sensor</span>
                      </div>
                      <span className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>Wind Sensor</span>
                      </div>
                      <span className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu size={18} />
                        <span>Pressure Sensor</span>
                      </div>
                      <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                        Needs Calibration
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Modules</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>UPS Module</span>
                      </div>
                      <span className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>Network Module</span>
                      </div>
                      <span className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>Storage Module</span>
                      </div>
                      <span className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive size={18} />
                        <span>Gas Cylinder Module</span>
                      </div>
                      <span className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button className="flex items-center gap-2" icon={<RefreshCw />} variant="outline">
                  Refresh Peripherals
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="serial" className="space-y-6 w-full flex-1 mt-0">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Component Serial Numbers</h2>
              <div className="space-y-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-2 font-medium">Component</th>
                      <th className="text-left py-2 font-medium">Serial Number</th>
                      <th className="text-left py-2 font-medium">Manufacture Date</th>
                      <th className="text-left py-2 font-medium">Last Calibration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="py-3">Main System</td>
                      <td className="py-3 font-mono text-sm">FLS-2023-0001-A</td>
                      <td className="py-3">2023-06-15</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="py-3">TVOC Sensor</td>
                      <td className="py-3 font-mono text-sm">SNS-TVOC-2023-0042</td>
                      <td className="py-3">2023-05-22</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="py-3">EtO Sensor</td>
                      <td className="py-3 font-mono text-sm">SNS-ETO-2023-0036</td>
                      <td className="py-3">2023-05-20</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="py-3">Wind Sensor</td>
                      <td className="py-3 font-mono text-sm">SNS-WIND-2023-0028</td>
                      <td className="py-3">2023-04-18</td>
                      <td className="py-3">2024-01-10</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="py-3">Pressure Sensor</td>
                      <td className="py-3 font-mono text-sm">SNS-PRES-2023-0051</td>
                      <td className="py-3">2023-06-02</td>
                      <td className="py-3 text-yellow-600 dark:text-yellow-400">
                        Needs Calibration
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="py-3">UPS Module</td>
                      <td className="py-3 font-mono text-sm">UPS-2023-0018-B</td>
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

          <TabsContent value="terminal" className="space-y-6 w-full flex-1 mt-0">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">System Terminal</h2>
              <div className="bg-black text-primary-400 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto whitespace-pre-wrap mb-4">
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

          <TabsContent value="testing" className="space-y-6 w-full flex-1 mt-0">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Testing Applications</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Diagnostic Tests</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      icon={<Cpu size={18} />}>
                      Run Sensor Diagnostics
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      icon={<HardDrive size={18} />}>
                      Test Storage Integrity
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      icon={<Settings size={18} />}>
                      Calibrate Pressure Sensor
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      icon={<AlertCircle size={18} />}>
                      Test Alert System
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Root Access Tab */}
          <TabsContent value="root" className="space-y-6 w-full flex-1 mt-0">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Root Level Configuration</h2>
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This section provides access to critical system configurations, which may affect
                  system stability and measurement accuracy. Proceed with caution.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-md font-medium">System Configuration</h3>
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
                  <h3 className="text-md font-medium">Advanced Settings</h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-sm">Measurement Interval (seconds)</label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">Data Retention Period (days)</label>
                      <Input type="number" defaultValue="90" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">Remote Access</label>
                      <select className="w-full h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                        <option>Disabled</option>
                        <option>SSH Only</option>
                        <option>Full Access</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">Log Level</label>
                      <select className="w-full h-10 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
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
              <div className="mt-6 flex gap-4">
                <Button onClick={() => setSetupViewOn(true)} variant="outline" icon={<Settings />}>
                  {" "}
                  Setup Wizard
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  icon={<AlertCircle />}
                  className="hover:bg-red-600 dark:hover:bg-red-700">
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
