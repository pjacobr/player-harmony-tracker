import { RectangleProps } from "recharts";

interface MedianLineProps extends RectangleProps {
  color?: string;
}

export const MedianLine = (props: MedianLineProps) => {
  const { x, y, width, color = "hsl(var(--primary))" } = props;
  if (x == null || y == null || width == null) return null;
  
  return (
    <line 
      x1={x} 
      y1={y} 
      x2={x + width} 
      y2={y} 
      stroke={color}
      strokeWidth={2}
    />
  );
};