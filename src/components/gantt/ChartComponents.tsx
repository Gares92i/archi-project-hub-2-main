
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Rectangle } from "recharts";
import { ChartTask } from "./types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  dateRange: Date[];
}

export const CustomTooltip = ({ active, payload, dateRange }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 shadow-md rounded-md border">
        <p className="font-semibold">{data.name}</p>
        <p>Début: {format(new Date(data.start), 'dd MMM yyyy', { locale: fr })}</p>
        <p>Fin: {format(new Date(data.end), 'dd MMM yyyy', { locale: fr })}</p>
        <p>Progression: {data.progress}%</p>
        <p className="text-xs text-gray-500 mt-1">Cliquez et glissez pour déplacer</p>
        <p className="text-xs text-gray-500">Utilisez les bords pour redimensionner</p>
      </div>
    );
  }
  return null;
};

interface CustomBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartTask;
  onMouseDown?: (taskId: string, start: number, end: number, position: number, type: 'move' | 'resize-start' | 'resize-end') => void;
  dateRange: Date[];
}

export const CustomBar = (props: CustomBarProps) => {
  const { x, y, width, height, payload, onMouseDown, dateRange } = props;
  
  if (!x || !y || !width || !height || !payload) return null;
  
  const progress = payload.progress || 0;
  const progressWidth = (width * progress) / 100;
  const handleWidth = 6; // Width of the resize handles
  
  const handleBarMouseDown = (e: React.MouseEvent, type: 'move' | 'resize-start' | 'resize-end') => {
    e.stopPropagation();
    if (onMouseDown && payload.id) {
      onMouseDown(payload.id, payload.start, payload.end, e.clientX, type);
    }
  };
  
  return (
    <g>
      {/* Background */}
      <Rectangle 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill="#e0e0e0" 
        radius={[4, 4, 4, 4]}
        cursor="move"
        onMouseDown={(e) => handleBarMouseDown(e, 'move')}
      />
      
      {/* Progress Bar */}
      <Rectangle 
        x={x} 
        y={y} 
        width={progressWidth} 
        height={height} 
        fill="#3182CE" 
        radius={progress === 100 ? [4, 4, 4, 4] : [4, 0, 0, 4]}
        cursor="move"
        onMouseDown={(e) => handleBarMouseDown(e, 'move')}
      />
      
      {/* Left resize handle */}
      <Rectangle 
        x={x} 
        y={y} 
        width={handleWidth} 
        height={height} 
        fill="#2563EB" 
        radius={[4, 0, 0, 4]}
        cursor="ew-resize"
        onMouseDown={(e) => handleBarMouseDown(e, 'resize-start')}
      />
      
      {/* Right resize handle */}
      <Rectangle 
        x={x + width - handleWidth} 
        y={y} 
        width={handleWidth} 
        height={height} 
        fill="#2563EB" 
        radius={[0, 4, 4, 0]}
        cursor="ew-resize"
        onMouseDown={(e) => handleBarMouseDown(e, 'resize-end')}
      />
      
      {/* Task label - optional, if you want to show it on the bar itself */}
      {width > 50 && (
        <text
          x={x + 10}
          y={y + height/2 + 4}
          fill="#fff"
          fontSize={10}
          fontWeight="bold"
          pointerEvents="none"
        >
          {progress}%
        </text>
      )}
    </g>
  );
};
