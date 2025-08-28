import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSocket } from "@/hooks/useSocket";
import { socketService } from "@/lib/services/socketService";
import { useEffect, useState } from "react";

// All namespaces from docker-compose - each listens to ALL events
const ALL_NAMESPACES = [
  "fenceline_job_state_machine",
  "anemometer_data",
  "catalytic_converter_data",
  "gas_tank_data",
  "hvac_system_data",
  "temperature_controller_data",
  "mfc_data",
  "samlet_data",
  "analyzer_live_data"
];

// Topic arrays for UI (all show "All Events")
const FENCELINE_TOPICS = ["all_events"];
const ANEMOMETER_TOPICS = ["all_events"];
const CATALYTIC_TOPICS = ["all_events"];
const GAS_TANK_TOPICS = ["all_events"];
const HVAC_TOPICS = ["all_events"];
const TEMP_CONTROLLER_TOPICS = ["all_events"];
const MFC_TOPICS = ["all_events"];
const SAMLET_TOPICS = ["all_events"];
const ANALYZER_TOPICS = ["all_events"];

interface StreamItem {
  topic: string;
  namespace: string;
  data: unknown;
  timestamp: number;
}

export function SocketDebugger() {
  const { connected, subcomponentData, fencelineJobState, setNamespace } =
    useSocket();
  const [streamData, setStreamData] = useState<StreamItem[]>([]);
  const [enabledTopics, setEnabledTopics] = useState<Record<string, boolean>>(
    [
      ...FENCELINE_TOPICS,
      ...ANEMOMETER_TOPICS,
      ...CATALYTIC_TOPICS,
      ...GAS_TANK_TOPICS,
      ...HVAC_TOPICS,
      ...TEMP_CONTROLLER_TOPICS,
      ...MFC_TOPICS,
      ...SAMLET_TOPICS,
      ...ANALYZER_TOPICS
    ].reduce((acc, topic) => ({ ...acc, [topic]: true }), {})
  );

  // Handle raw socket events
  useEffect(() => {
    if (!connected) return;

    const handleRawEvent = (
      topic: string,
      data: unknown,
      namespace: string
    ) => {
      if (enabledTopics[topic]) {
        setStreamData((prev) =>
          [{ topic, namespace, data, timestamp: Date.now() }, ...prev].slice(
            0,
            10
          )
        );
      }
    };

    // Add listeners for ALL events in ALL namespaces
    const cleanupFunctions = ALL_NAMESPACES.map((namespace) => {
      return socketService.onNamespaceAnyEvent(
        namespace,
        (eventName: string, data: unknown) => {
          handleRawEvent(eventName, data, `/${namespace}`);
        }
      );
    });

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup?.());
    };
  }, [connected, enabledTopics]);

  // Update stream data when socket data changes
  useEffect(() => {
    const newStreamData: StreamItem[] = [];

    if (enabledTopics["all_events"] && subcomponentData.length > 0) {
      newStreamData.push({
        topic: "subcomponent_data",
        namespace: "/various_namespaces",
        data: subcomponentData[0],
        timestamp: subcomponentData[0].timestamp
      });
    }

    if (enabledTopics["all_events"] && fencelineJobState) {
      newStreamData.push({
        topic: "fenceline_job_state",
        namespace: "/fenceline_job_state_machine",
        data: fencelineJobState,
        timestamp: Date.now()
      });
    }

    if (newStreamData.length > 0) {
      setStreamData((prev) => [...newStreamData, ...prev].slice(0, 10));
    }
  }, [subcomponentData, fencelineJobState, enabledTopics]);

  const toggleTopic = (topic: string) => {
    setEnabledTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const handleConnect = () => {
    setNamespace("/fenceline_job_state_machine");
  };

  const handleDisconnect = () => {
    setNamespace("");
  };

  const clearStreamData = () => {
    setStreamData([]);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatData = (data: unknown) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          websocket debugger utility
          <Badge
            variant={connected ? "default" : "destructive"}
            className={connected ? "bg-primary-500" : ""}
          >
            {connected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Connect to all 9 system namespaces: Fenceline Job State Machine,
          Anemometer, Catalytic Converter, Gas Tanks, HVAC System, Temperature
          Controllers, MFCs, SamLet, and Analyzer - listening to ALL events in
          each
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="gap-4 grid">
            <div className="gap-2 grid">
              <Label>Subscribe to Topics</Label>
              <div className="gap-4 grid grid-cols-3">
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /fenceline_job_state_machine namespace
                  </h4>
                  <div className="gap-2 grid">
                    {FENCELINE_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /anemometer_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {ANEMOMETER_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /catalytic_converter_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {CATALYTIC_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /gas_tank_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {GAS_TANK_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /hvac_system_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {HVAC_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /temperature_controller_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {TEMP_CONTROLLER_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /mfc_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {MFC_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /samlet_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {SAMLET_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-sm">
                    /analyzer_live_data namespace
                  </h4>
                  <div className="gap-2 grid">
                    {ANALYZER_TOPICS.map((topic) => (
                      <div key={topic} className="flex items-center space-x-2">
                        <Checkbox
                          id={topic}
                          checked={enabledTopics[topic]}
                          onCheckedChange={() => toggleTopic(topic)}
                          disabled={connected}
                        />
                        <label
                          htmlFor={topic}
                          className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                        >
                          {topic === "all_events" ? "All Events" : topic}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-mono text-sm break-all">
              {connected
                ? "Connected to all 9 namespaces: /fenceline_job_state_machine, /anemometer_data, /catalytic_converter_data, /gas_tank_data, /hvac_system_data, /temperature_controller_data, /mfc_data, /samlet_data, /analyzer_live_data"
                : "Disconnected"}
            </p>
          </div>

          {/* Stream data display */}
          {streamData.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Stream Data ({streamData.length} events)</Label>
                <Button variant="outline" size="sm" onClick={clearStreamData}>
                  Clear
                </Button>
              </div>
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 shadow-xl p-4 rounded-xl ring-1 ring-neutral-50 h-80 overflow-y-auto font-mono text-primary-300 text-xs">
                {streamData.map((item, index) => (
                  <div
                    key={index}
                    className="mb-4 pb-2 border-gray-700 border-b"
                  >
                    <div className="flex justify-between text-gray-400">
                      <span>
                        Topic: {item.topic} ({item.namespace})
                      </span>
                      <span>{formatTimestamp(item.timestamp)}</span>
                    </div>
                    <pre className="mt-1 overflow-x-auto">
                      {formatData(item.data)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleDisconnect}
          disabled={!connected}
        >
          Disconnect
        </Button>
        <Button onClick={handleConnect} disabled={connected} variant="primary">
          Connect
        </Button>
      </CardFooter>
    </Card>
  );
}
