import { RectangleProps } from "recharts";

interface WhiskerLineProps extends RectangleProps {
  color?: string;
}

export const WhiskerLine = (props: WhiskerLineProps) => {
  const { x, y, width, height, color = "hsl(var(--primary))" } = props;
  if (x == null || y == null || width == null || height == null) return null;

  return (
    <line
      x1={x + width / 2}
      y1={y + height}
      x2={x + width / 2}
      y2={y}
      stroke={color}
      strokeWidth={1}
      strokeDasharray="4"
    />
  );
};