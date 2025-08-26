interface ScaleInfo {
  pixelsPerUnit: number;
  metersPerUnit: number;
  scaleBarUnits: number;
  scaleBarWidth: number;
  realWorldDistance: number;
  displayText: string;
  scaleRatio: string;
  unitConfig: {
    metersPerUnit: number;
    displayUnit: string;
    displayUnitName: string;
  };
}

interface ScaleIndicatorProps {
  containerSize: { width: number; height: number } | null;
  imgSize: { width: number; height: number } | null;
}

export const ScaleIndicator = ({
  containerSize,
  imgSize
}: ScaleIndicatorProps) => {
  const getScaleInfo = (): ScaleInfo | null => {
    if (!containerSize || !imgSize) {
      return null;
    }

    // Configuration for coordinate system
    // Adjust these values based on your actual coordinate system
    const COORDINATE_CONFIG = {
      // If 1 coordinate unit = 1 meter, set this to 1
      // If 1 coordinate unit = 1 centimeter, set this to 0.01
      // If 1 coordinate unit = 1 foot, set this to 0.3048
      metersPerUnit: 0.1, // Adjust this based on your coordinate system

      // Display units (can be 'm', 'cm', 'ft', 'yd', etc.)
      displayUnit: "m",
      displayUnitName: "meter(s)"
    };

    // Calculate the scale factor based on current zoom
    const pixelsPerUnit = containerSize.width / imgSize.width;

    // Calculate a more meaningful scale bar length
    // Show scale for a reasonable number of coordinate units
    let scaleBarUnits = 10;
    let scaleBarPixels = scaleBarUnits * pixelsPerUnit;

    // Adjust scale bar units based on the coordinate system
    if (COORDINATE_CONFIG.metersPerUnit < 0.1) {
      scaleBarUnits = 100; // Show more units for smaller scales
    } else if (COORDINATE_CONFIG.metersPerUnit > 1) {
      scaleBarUnits = 5; // Show fewer units for larger scales
    }

    scaleBarPixels = scaleBarUnits * pixelsPerUnit;

    // Limit scale bar width for better visibility
    const maxScaleBarWidth = 150;
    const minScaleBarWidth = 60;
    const scaleBarWidth = Math.max(
      minScaleBarWidth,
      Math.min(scaleBarPixels, maxScaleBarWidth)
    );

    // Calculate real-world distance
    const realWorldDistance = scaleBarUnits * COORDINATE_CONFIG.metersPerUnit;

    return {
      pixelsPerUnit,
      metersPerUnit: COORDINATE_CONFIG.metersPerUnit,
      scaleBarUnits,
      scaleBarWidth,
      realWorldDistance,
      displayText: `${scaleBarUnits} coordinate units ≈ ${realWorldDistance.toFixed(
        2
      )} ${COORDINATE_CONFIG.displayUnitName}`,
      scaleRatio: `1:${(1 / pixelsPerUnit).toFixed(2)}`,
      unitConfig: COORDINATE_CONFIG
    };
  };

  const scaleInfo = getScaleInfo();

  if (!scaleInfo) return null;

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex items-center space-x-1">
          <div
            className="h-2 bg-gray-800 rounded-l-full"
            style={{ width: `${scaleInfo.scaleBarWidth}px` }}
          ></div>
          <div className="w-1 h-2 bg-gray-800"></div>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {scaleInfo.displayText}
        </span>
      </div>
      <div className="text-xs text-gray-500">Scale: {scaleInfo.scaleRatio}</div>
    </div>
  );
};
