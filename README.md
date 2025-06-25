## Workplace Monitoring System

more detailed readme coming soon..

<img src="https://github.com/user-attachments/assets/9d13fa4b-1cdb-42a4-b915-5efa0a204179" width="1000" alt="Workplace Monitoring System" style="margin-bottom: 8px;">

### Tech Stack

- **Framework**: React Typescript
- **Build Tool**: Vite
- **Styles**: TailwindCSS + shadcn/ui components
- **3D Rendering**: Three.js with React Three Fiber
- **Data Visualization**: Modern charting libraries for real-time data display
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**:
  - Radix UI primitives (shadcn/ui deps)
  - Mantine Hooks (browser APIs - localStorage, window/element size, scroll positions, intersection observers)
  - Lucide icons

### Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── context/       # React context providers
  ├── pages/         # Application pages/routes
  │   ├── dashboard/
  │   ├── live-data/
  │   ├── data-review/
  │   └── service/
  └── styles/        # Global styles and Tailwind config
```

### How to run

```sh
git clone https://github.com/picarro/wms-ui.git
cd wms-ui
npm install
npm run dev
```
