# Utils Organization

This directory contains all utility functions and follows the centralized import pattern required by the cursor rules.

## Directory Structure

```
src/utils/
├── api/                    # API utilities
│   ├── authAPI.ts         # Authentication API
│   └── ProtectedBaseQuery.ts # Protected base query
├── charts/                 # Chart utilities
│   └── chartUtils.ts      # Chart colors and utilities
├── hooks/                  # Utility hooks
│   ├── useOnWindowResize.tsx # Window resize hook
│   └── useScroll.ts       # Scroll position hook
├── ui/                     # UI utilities
│   └── utils.ts           # UI utility functions
├── formatting/             # Formatting utilities
│   ├── textFormatting.ts  # Text formatting
│   ├── timeFormatting.ts  # Time and date formatting
│   └── thresholdUtils.ts  # Threshold utilities
├── index.ts                # Main export file
└── README.md               # This documentation
```

## Import Pattern

**ALWAYS** import utilities from `@/utils` instead of individual files or `@/lib`:

```typescript
// ✅ CORRECT - Use centralized import
import { formatLabel, cn, chartColors, useScroll } from "@/utils";

// ❌ WRONG - Don't import from individual files
import { formatLabel } from "@/utils/textFormatting";
import { cn } from "@/lib/utils";
```

## Available Utilities

### Formatting Utilities

- `formatLabel` - Text formatting for labels
- `formatDateTime` - Date and time formatting
- `formatDate` - Date-only formatting
- `formatTime` - Time-only formatting
- `formatUnixTimestamp` - Unix timestamp formatting

### UI Utilities

- `cn` - Class name utility (clsx + tailwind-merge)
- `cx` - Alternative class name utility
- `focusInput` - Focus ring styles for inputs
- `focusRing` - Focus ring styles for general elements
- `hasErrorInput` - Error state styles for inputs

### Formatter Functions

- `formatters.currency` - Currency formatting
- `formatters.unit` - Unit number formatting
- `formatters.percentage` - Percentage formatting
- `formatters.million` - Million value formatting
- `percentageFormatter` - Percentage formatter utility

### Chart Utilities

- `chartColors` - Color palette for charts
- `ColorUtility` - Type for color utilities
- `AvailableChartColors` - Array of available chart colors
- `AvailableChartColorsKeys` - Type for chart color keys
- `constructCategoryColors` - Build category color mapping
- `getColorClassName` - Get CSS class for chart colors
- `getGradientColorClassName` - Get gradient color CSS class
- `getYAxisDomain` - Calculate Y-axis domain
- `hasOnlyOneValueForKey` - Check if data has single value for key

### Hook Utilities

- `useOnWindowResize` - Window resize hook
- `useScroll` - Scroll position hook

### Threshold Utilities

- All threshold-related utility functions

### API Utilities

- `authApi` - Authentication API instance
- `useLoginMutation` - Login mutation hook
- `useLogoutMutation` - Logout mutation hook
- `useRequiredUpdatePasswordMutation` - Password update hook
- `protectedBaseQuery` - Protected base query function

## Adding New Utilities

1. **Create the utility file** in the appropriate subdirectory
2. **Export from the main index.ts** file
3. **Update this README** to document the new utility
4. **Use the centralized import pattern** in all components

## Cursor Rules Compliance

This organization ensures:

- ✅ Single import point for all utilities (`@/utils`)
- ✅ No direct imports from `@/lib` in components
- ✅ Centralized utility management
- ✅ Consistent import patterns across the codebase
- ✅ Easy maintenance and refactoring
- ✅ Logical organization by utility type
