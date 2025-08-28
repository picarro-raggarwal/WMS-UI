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
├── lib/                # Utility libraries and services
│   ├── services/       # API and socket services
│   └── store.ts        # Redux store configuration
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and utilities
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or yarn 1.22+
- Modern web browser with WebGL support

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/picarro/wms-ui.git
   cd wms-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
VITE_APP_TITLE=Workplace Monitoring System
```

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

- Real-time sensor data display
- Interactive charts and graphs
- Configurable measurement views
- Wind and environmental data

### Data Review

- Historical data analysis
- Custom date range selection
- Data export capabilities
- Statistical analysis tools

### Map Display

- Geographic boundary mapping
- Interactive boundary creation
- Scale indicators and controls
- Animated markers and overlays

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
