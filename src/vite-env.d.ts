/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UI_VERSION: string;

  // Vite Proxy Configuration (Development)
  readonly VITE_PROXY_WMS_API_TARGET?: string;
  readonly VITE_PROXY_AUTH_API_TARGET?: string;
  readonly VITE_PROXY_API_TARGET?: string;
  readonly VITE_PROXY_SOCKET_IO_TARGET?: string;

  // WMS API paths
  readonly VITE_WMS_SYSTEM_STATUS_API_BASE_URL?: string;
  readonly VITE_WMS_MANAGE_INLET_API_BASE_URL?: string;
  readonly VITE_WMS_SYSTEM_HEALTH_API_BASE_URL?: string;

  // Fenceline API paths
  readonly VITE_FENCELINE_API_BASE_URL?: string;
  readonly VITE_FENCELINE_RECIPE_BASE_URL?: string;
  readonly VITE_STATE_MACHINE_API_BASE_URL?: string;
  readonly VITE_FENCELINE_SCHEDULER_API_BASE_URL?: string;
  readonly VITE_FENCELINE_JOB_API_BASE_URL?: string;
  readonly VITE_FENCELINE_ALERT_API_BASE_URL?: string;
  readonly VITE_FENCELINE_QAQC_API_BASE_URL?: string;
  readonly VITE_FENCELINE_SETTINGS_API_BASE_URL?: string;
  readonly VITE_FENCELINE_DATA_EXPORT_API_BASE_URL?: string;
  readonly VITE_FENCELINE_SCHEDULER_API_BASE_URL?: string;
  readonly VITE_FENCELINE_JOB_API_BASE_URL?: string;
  readonly VITE_FENCELINE_ALERT_API_BASE_URL?: string;
  readonly VITE_FENCELINE_QAQC_API_BASE_URL?: string;
  readonly VITE_FENCELINE_SETTINGS_API_BASE_URL?: string;

  // System API paths
  readonly VITE_SYSTEM_STATUS_API_BASE_URL?: string;
  readonly VITE_THRESHOLDS_API_BASE_URL?: string;
  readonly VITE_TIMESYNC_API_BASE_URL?: string;

  // Auth API paths
  readonly VITE_AUTH_API_BASE_URL?: string;
  readonly VITE_AUTH_API_V1_BASE_URL?: string;

  // WebSocket Configuration
  readonly VITE_SOCKET_IO_PATH?: string;

  // Keycloak Configuration
  readonly VITE_KEYCLOAK_REALMS?: string;
  readonly VITE_KEYCLOAK_CLIENTID?: string;
  readonly VITE_AUTH_CLIENT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
