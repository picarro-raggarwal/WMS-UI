import { getBgColor, MockData } from "../data/mock-data";

// const colors = [
//   { name: "Red", value: "#EF4444", class: "bg-red-500" },
//   { name: "Green", value: "#22C55E", class: "bg-green-500" },
//   { name: "Cyan", value: "#06B6D4", class: "bg-cyan-500" },
//   { name: "Amber", value: "#F59E42", class: "bg-amber-500" },
// ];

interface BlockGridProps {
  selectedBlock: MockData | null;
  onBlockSelect: (block: MockData) => void;
  liveData: MockData[];
}

export const BlockGrid = ({
  selectedBlock,
  onBlockSelect,
  liveData
}: BlockGridProps) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 p-2 border rounded-xl">
      {liveData.map((block) => (
        <div
          key={block.id}
          className={`flex relative justify-center items-center shadow-card rounded-2xl focus:ring-2 w-24 h-14 hover:scale-105 transition-all duration-300
            ${getBgColor(block.status)} 
            ${
              selectedBlock?.id === block.id
                ? "ring-1 ring-blue-500 scale-105"
                : ""
            }
            `}
          onClick={() => onBlockSelect(block)}
        >
          {block.isSampling && (
            <span className="top-1 right-1 absolute bg-green-600 rounded-full w-4 h-4"></span>
          )}
          {block.isPrime && (
            <span className="top-1 right-1 absolute bg-blue-600 rounded-full w-4 h-4"></span>
          )}

          {block.label}
        </div>
      ))}
    </div>
  );
};
