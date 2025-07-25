import { authApi } from "@/common/authAPI";
import { systemInfoApi } from "@/lib/services/systemInfo.slice";
import { timeSyncApi } from "@/lib/services/timesync.slice";
import { alertsApi } from "@/pages/alerts/data/alerts.slice";
import { gasTanksApi } from "@/pages/dashboard/data/gasTanks.slice";
import { systemMetricsApi } from "@/pages/dashboard/data/systemMetrics.slice";
import { systemStatusApi } from "@/pages/dashboard/data/systemStatus.slice";
import { dataExportApi } from "@/pages/data-review/data/dataExport.api";
import { dataReviewApi } from "@/pages/data-review/data/dataReview.api";
import { metricsApi } from "@/pages/live-data/data/metrics.slice";
import { fencelineJobApi } from "@/pages/method/data/fencelineJob.slice";
import { fencelineSchedulerApi } from "@/pages/method/data/fencelineScheduler.slice";
import { fencelineStateMachineApi } from "@/pages/method/data/fencelineStateMachine.slice";
import { recipesApi } from "@/pages/method/data/recipes.slice";
import { settingsApi } from "@/pages/settings/data/settings.slice";
import { thresholdsApi } from "@/pages/settings/data/thresholds.slice";
import { userManagementApi } from "@/pages/settings/data/user-management.slice";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import socketReducer from "./services/socketSlice";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    [authApi.reducerPath]: authApi.reducer,
    [recipesApi.reducerPath]: recipesApi.reducer,
    [systemStatusApi.reducerPath]: systemStatusApi.reducer,
    [systemMetricsApi.reducerPath]: systemMetricsApi.reducer,
    [gasTanksApi.reducerPath]: gasTanksApi.reducer,
    [fencelineStateMachineApi.reducerPath]: fencelineStateMachineApi.reducer,
    [fencelineSchedulerApi.reducerPath]: fencelineSchedulerApi.reducer,
    [fencelineJobApi.reducerPath]: fencelineJobApi.reducer,
    [metricsApi.reducerPath]: metricsApi.reducer,
    [dataReviewApi.reducerPath]: dataReviewApi.reducer,
    [dataExportApi.reducerPath]: dataExportApi.reducer,
    [timeSyncApi.reducerPath]: timeSyncApi.reducer,
    [systemInfoApi.reducerPath]: systemInfoApi.reducer,
    [thresholdsApi.reducerPath]: thresholdsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [alertsApi.reducerPath]: alertsApi.reducer,
    [userManagementApi.reducerPath]: userManagementApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(recipesApi.middleware)
      .concat(systemStatusApi.middleware)
      .concat(systemMetricsApi.middleware)
      .concat(gasTanksApi.middleware)
      .concat(fencelineStateMachineApi.middleware)
      .concat(fencelineSchedulerApi.middleware)
      .concat(fencelineJobApi.middleware)
      .concat(metricsApi.middleware)
      .concat(dataReviewApi.middleware)
      .concat(dataExportApi.middleware)
      .concat(timeSyncApi.middleware)
      .concat(systemInfoApi.middleware)
      .concat(thresholdsApi.middleware)
      .concat(settingsApi.middleware)
      .concat(alertsApi.middleware)
      .concat(userManagementApi.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
