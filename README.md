# Workplace Monitoring System (WMS)

A comprehensive, real-time monitoring and control system designed for workplace safety, environmental compliance, and operational efficiency. The WMS provides continuous monitoring of air quality, gas concentrations, environmental conditions, and system performance through an intuitive web-based interface.

![Workplace Monitoring System](https://github.com/user-attachments/assets/9d13fa4b-1cdb-42a4-b915-5efa0a204179)

## 🚀 Features

### Core Monitoring Capabilities

- **Real-time Gas Detection**: Continuous monitoring of hazardous gas concentrations
- **Environmental Monitoring**: Temperature, humidity, pressure, and wind conditions
- **System Health Tracking**: Equipment status, performance metrics, and maintenance alerts
- **Data Visualization**: Interactive charts, graphs, and real-time dashboards
- **Alert Management**: Configurable thresholds and instant notifications

### Advanced Features

- **3D System Visualization**: Interactive 3D models with React Three Fiber
- **Historical Data Analysis**: Comprehensive data review and export capabilities
- **Recipe Management**: Configurable measurement and calibration procedures
- **User Management**: Role-based access control and authentication
- **Mobile Responsive**: Optimized for desktop and mobile devices

### Safety & Compliance

- **Threshold Monitoring**: Configurable safety limits and alerts
- **Audit Logging**: Complete system activity tracking
- **Calibration Management**: Gas cylinder and sensor calibration workflows
- **Reporting Tools**: Automated report generation and export

## 🏗️ Architecture

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: Redux Toolkit with RTK Query for API management
- **3D Graphics**: Three.js with React Three Fiber for 3D visualizations
- **Charts**: ECharts and custom charting components for data visualization

### Backend Integration

- **API Layer**: RESTful APIs with protected authentication
- **Real-time Communication**: WebSocket integration for live data streaming
- **Data Persistence**: Historical data storage and retrieval
- **Authentication**: JWT-based secure authentication system

### Development Tools

- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives and custom components
- **Icons**: Lucide icon library
- **Testing**: Comprehensive testing suite (planned)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── tremor/         # Chart and visualization components
│   └── app-sidebar.tsx # Main navigation sidebar
├── context/            # React context providers
│   ├── AuthContext.tsx # Authentication context
│   └── DataContext.tsx # Global data context
├── pages/              # Application pages and routes
│   ├── dashboard/      # Main system dashboard
│   ├── live-data/      # Real-time monitoring views
│   ├── data-review/    # Historical data analysis
│   ├── alerts/         # Alert management and history
│   ├── map-display/    # Geographic and boundary mapping
│   ├── method/         # Recipe and procedure management
│   ├── qa-qc/          # Quality assurance and calibration
│   ├── service/        # System setup and configuration
│   └── settings/       # User and system settings
├── lib/                # Redux store and API services
│   ├── services/       # API and socket services
│   └── store.ts        # Redux store configuration
├── hooks/              # Custom React hooks
├── types/              # Centralized TypeScript types
    ├── common/         # Common types (API, charts)
    ├── index.ts        # Single export point for all types
    └── socket.ts       # WebSocket specific types
└── utils/              # Centralized utility functions
    ├── api/            # API utilities (auth, queries)
    ├── charts/         # Chart utilities and colors
    ├── formatting/     # Text, time, threshold formatting
    ├── hooks/          # Utility hooks (scroll, resize)
    ├── ui/             # UI utilities (class names, formatters)
    └── index.ts        # Single export point for all utilities
```

## 🛠️ Utils Organization

The project follows a centralized utility organization pattern for better maintainability and consistency:

### **Import Pattern**

All utilities are imported from a single entry point:

```typescript
// ✅ CORRECT - Single import point
import { formatLabel, cn, chartColors, useScroll } from "@/utils";

// ❌ WRONG - Don't import from individual files
import { formatLabel } from "@/utils/formatting/textFormatting";
```

### **Available Utility Categories**

- **Formatting**: Text, time, and threshold formatting utilities
- **UI**: Class name utilities, formatters, and focus styles
- **Charts**: Color palettes, chart helpers, and domain calculations
- **Hooks**: Custom utility hooks for scroll and window resize
- **API**: Authentication, protected queries, and API utilities

### **Benefits**

- **Single source of truth** for all utilities
- **Easy refactoring** without updating multiple imports
- **Consistent patterns** across the codebase
- **Better discoverability** for developers

## 📝 **Types Organization**

The project follows a centralized types organization pattern for better maintainability and consistency:

### **Import Pattern**

All types are imported from a single entry point:

```typescript
// ✅ CORRECT - Single import point
import { BaseResponse, ChartDataPoint, Alert, Recipe } from "@/types";

// ❌ WRONG - Don't import from individual files
import { Alert } from "@/pages/alerts/data/alerts.slice";
```

### **Available Type Categories**

- **Common API**: Response wrappers, pagination, error handling
- **Common Charts**: Chart data, configuration, wind rose types
- **Feature-Specific**: Types used by individual features (dashboard, alerts, etc.)
- **WebSocket**: Real-time data and communication types

### **Benefits**

- **Single source of truth** for all types
- **Easy refactoring** without updating multiple imports
- **Consistent patterns** across the codebase
- **Reduced duplication** through shared common types

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ (check with `node --version`)
- npm 9+ or yarn 1.22+ (check with `npm --version`)
- Modern web browser with WebGL support

### Running Locally

Follow these steps to run the WMS-UI application on your local machine:

1. **Clone the repository**

   ```bash
   git clone https://github.com/picarro/wms-ui.git
   cd wms-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install all required packages and dependencies listed in `package.json`.

3. **Configure environment variables (optional)**

   Create a `.env.local` file in the root directory if you need to customize API endpoints or other settings:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_WS_URL=ws://localhost:3000/ws
   VITE_APP_TITLE=Workplace Monitoring System
   ```

   > **Note:** The application will work with default settings if you skip this step.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The development server will start and display the local URL (typically `http://localhost:3001`).

5. **Open your browser**

   Navigate to the URL shown in the terminal (usually `http://localhost:3001`).

   The application should now be running locally and will automatically reload when you make changes to the code.

### Available Scripts

```bash
npm run dev          # Start development server (runs on http://localhost:3001)
npm run build        # Build for production
npm run buildwithts  # Build with TypeScript type checking
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality checks
```

### Troubleshooting

If you encounter issues:

- **Port already in use**: If port 3001 is occupied, Vite will automatically use the next available port
- **Dependencies issues**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **Type errors**: Run `npm run buildwithts` to check for TypeScript errors

## 🔧 Configuration

### Environment Variables

For basic local development, environment variables are optional. However, if you need to customize API endpoints or other settings, create a `.env.local` file in the root directory (see [Running Locally](#running-locally) for basic setup).

Available environment variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api    # Backend API base URL
VITE_WS_URL=ws://localhost:3000/ws             # WebSocket server URL for real-time data
VITE_APP_TITLE=Workplace Monitoring System      # Application title
```

> **Note:** These variables are prefixed with `VITE_` because Vite only exposes environment variables that start with this prefix to the client-side code.

### API Server Configuration

If you need to update the API server paths or WebSocket endpoints (e.g., `/api`, `/auth-api`, `/wms-api`, `/socket.io`), edit the proxy configuration in `vite.config.ts`.

The proxy settings are located in the `server.proxy` section:

```typescript
server: {
  port: 3001,
  proxy: {
    "/wms-api": {
      target: "http://your-server:8000",
      // ... proxy configuration
    },
    "/auth-api": {
      target: "http://your-auth-server:8098",
      // ... proxy configuration
    },
    "/api": {
      target: "http://your-api-server:8000",
      // ... proxy configuration
    },
    "/socket.io": {
      target: "ws://your-websocket-server:8090",
      // ... proxy configuration
    }
  }
}
```

> **Note:** After modifying `vite.config.ts`, you need to restart the development server (`npm run dev`) for the changes to take effect.

### Docker Deployment

The project includes Docker configuration for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run individually
docker build -t wms-ui .
docker run -p 3000:3000 wms-ui
```

## 📊 Key Components

### Dashboard

- Real-time system metrics and status
- Gas level monitoring and alerts
- 3D system visualization
- Quick action controls

### Live Data

The Live Data page provides real-time monitoring of all sensor ports in a responsive card-based layout. Each port card displays:

- **Port Information**: Port number, custom label, and current concentration values
- **Status Indicators**: Visual status bars showing Normal, Warning, Critical, or Flow Error states
- **Sampling Status**: Real-time indication when a port is actively sampling
- **Interactive Details**: Click any port card to view a detailed time series chart with:
  - 24-hour historical data visualization
  - Configurable threshold overlays (warning and alarm levels)
  - Zoom and pan controls for detailed analysis
  - Last updated timestamp and port metadata

The page automatically filters out disabled ports and adapts the card layout based on available screen space and the number of enabled ports.

### Data Review

The Data Review page enables comprehensive historical data analysis with advanced visualization capabilities:

- **Flexible Time Ranges**: Quick selection buttons for 1 hour, 24 hours, 7 days, or 1 month, plus a custom date range picker
- **Multi-Port Comparison**: Select up to 4 ports simultaneously to compare data across different sensors
- **Rolling Averages**: Apply 15-minute, 1-hour, or 24-hour rolling averages to smooth data trends
- **Chart Synchronization**: Enable synchronized X-axis zooming and panning across all displayed charts for easy comparison
- **Data Export**: Export selected time ranges and metrics to external formats for further analysis
- **Interactive Charts**: Zoom, pan, and reset controls for detailed data exploration
- **Real-time Updates**: Charts automatically regenerate when time ranges or port selections change

### Map Display

The Map Display page provides an interactive geographic visualization system for boundary and port management:

- **Boundary Management**:
  - Create custom boundaries by drawing polygons on the map
  - Edit, delete, and manage multiple boundaries
  - Visual boundary type indicators based on port statuses within each boundary
- **Port Placement**:
  - Place port markers within boundaries on the map
  - Drag and reposition port markers (with boundary validation)
  - Visual indicators for port status and sampling state
- **Color Blending**:
  - Enable color blending mode to visualize concentration levels across boundaries
  - Automatic calculation of blended colors based on port statuses within each boundary
- **Interactive Controls**:
  - Collapsible sidebar for boundary and port management
  - Scale indicators and coordinate display
  - Image overlay support for custom map backgrounds
  - Real-time validation to ensure ports remain within their assigned boundaries

### Settings

The Settings page provides comprehensive system configuration and management:

- **System Information**:
  - View system model, serial number, software version, and UI build
  - Display analyzer details and hardware specifications
  - Monitor system time, local time, and timezone information
- **Display Settings**:
  - Toggle dark mode (beta feature)
  - Switch between default and custom Blendr font
  - Configure sidebar default state (minimized or expanded)
- **Port Configuration**:
  - Enable/disable individual ports
  - Assign custom names and labels to ports
  - Configure port-specific settings and metadata
- **Species Threshold**:
  - Configure warning and alarm thresholds for different gas species
  - Set custom threshold values per port or globally
- **Smart Recipe**:
  - Manage measurement and calibration recipes
  - Configure automated sampling procedures
- **User Management**:
  - Create, edit, and manage user accounts
  - Configure role-based access control
  - Set user permissions and authentication settings

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Protected API endpoints
- Secure WebSocket connections
- Audit logging and monitoring

## 🧪 Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commit messages

### Testing Strategy

- Unit tests for utilities and hooks
- Component testing with React Testing Library
- Integration tests for data flows
- E2E tests for critical user journeys

## 📈 Performance

- Lazy loading of routes and components
- Optimized bundle splitting
- Efficient state management
- WebSocket optimization for real-time data
- Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain component reusability
- Write comprehensive tests
- Update documentation as needed
- Follow the established project structure

## 📄 License

This project is proprietary software developed by Picarro Inc. All rights reserved.

## 🆘 Support

For technical support or questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the project documentation
