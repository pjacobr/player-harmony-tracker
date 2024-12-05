import { RectangleProps } from "recharts";

export const MedianLine = (props: RectangleProps) => {
  const { x, y, width } = props;
  if (x == null || y == null || width == null) return null;
  
  return (
    <line 
      x1={x} 
      y1={y} 
      x2={x + width} 
      y2={y} 
      stroke="#E5DEFF" 
      strokeWidth={2}
    />
  );
};