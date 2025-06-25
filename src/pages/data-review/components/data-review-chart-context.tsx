import { createContext, useContext, ReactNode, useState } from 'react';
import type { ECharts } from 'echarts';

interface ChartContextType {
    chartInstance: echarts.ECharts | null;
    setChartInstance: (chart: ECharts | null) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

interface ChartProviderProps {
    children: ReactNode;
}

export const ChartProvider = ({ children }: ChartProviderProps) => {
    const [chartInstance, setChartInstance] = useState<ECharts | null>(null);

    return (
        <ChartContext.Provider
            value={{
                chartInstance,
                setChartInstance,
            }}
        >
            {children}
        </ChartContext.Provider>
    );
};

export const useChartContext = () => {
    const context = useContext(ChartContext);
    if (context === undefined) {
        throw new Error('useChartContext must be used within a ChartProvider');
    }
    return context;
};
