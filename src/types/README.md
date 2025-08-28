# Types Organization

This directory contains all TypeScript type definitions and interfaces, organized for better maintainability and consistency.

## Directory Structure

```
src/types/
├── common/              # Shared/common types
│   ├── api.ts          # Common API types (responses, requests)
│   └── charts.ts       # Common chart types
├── index.ts             # Main export point
├── socket.ts            # WebSocket specific types
└── README.md            # This documentation
```

## Import Pattern

**ALWAYS** import types from `@/types` instead of individual files:

```typescript
// ✅ CORRECT - Use centralized import
import {
  BaseResponse,
  ChartDataPoint,
  MetricConfig,
  Alert,
  Recipe
} from "@/types";

// ❌ WRONG - Don't import from individual files
import { BaseResponse } from "@/types";
import { Alert } from "@/pages/alerts/data/alerts.slice";
```

## Available Type Categories

### Common API Types (`@/types/common/api`)

- `BaseResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated data responses
- `ErrorResponse` - Error response structure
- `PaginationParams` - Pagination query parameters
- `DateRangeParams` - Date range parameters
- `TimestampedData` - Data with timestamps
- `IdentifiableData` - Data with ID field
- `NamedData` - Data with name fields
- `StatusData` - Data with status fields
- `MetricConfig` - Metric configuration
- `Threshold` - Threshold configuration

### Common Chart Types (`@/types/common/charts`)

- `ChartDataPoint` - Single chart data point
- `ChartSeries` - Chart data series
- `ChartConfig` - Chart configuration
- `ChartColors` - Chart color schemes
- `ChartTooltip` - Tooltip configuration
- `ChartAxis` - Axis configuration
- `WindDirection` - Wind direction types
- `WindRoseData` - Wind rose data structure

### Feature-Specific Types

- **Dashboard**: System metrics, gas tanks, system status
- **Data Review**: Wind rose, chart data, thresholds
- **Method**: Recipes, steps, scheduling
- **Alerts**: Alert definitions, responses, actions
- **Settings**: User management, thresholds, configurations
- **Live Data**: Metrics, real-time data
- **Map Display**: Boundaries, coordinates

### WebSocket Types (`@/types/socket.ts`)

- `SubcomponentData` - Subcomponent data updates
- `DriverAlert` - Driver alert notifications
- `FencelineJobState` - Job state updates
- `WebSocketJobData` - Job information
- `DataUpdatePayload` - Generic data updates
- Device-specific data types (anemometer, temperature, etc.)

## Adding New Types

### 1. **Feature-Specific Types**

Place in the appropriate feature folder:

```
src/pages/{feature-name}/types.ts
```

### 2. **Common Types**

Place in the appropriate common category:

```
src/types/common/{category}.ts
```

### 3. **Export from Main Index**

Add to `src/types/index.ts`:

```typescript
export * from "./common/{category}";
export * from "../pages/{feature-name}/types";
```

### 4. **Update Documentation**

Update this README to document new types.

## Type Organization Principles

1. **Feature Cohesion**: Types used by a single feature stay in that feature folder
2. **Common Reuse**: Types used across multiple features go in common
3. **Single Import Point**: All types accessible through `@/types`
4. **Clear Naming**: Descriptive names that indicate purpose
5. **Consistent Structure**: Similar interfaces follow similar patterns

## Benefits

- **Single Source of Truth**: All types available from `@/types`
- **Easy Refactoring**: Change type location without updating imports
- **Better Discoverability**: Developers know where to find types
- **Consistent Patterns**: All components follow the same import pattern
- **Reduced Duplication**: Common types shared across features
