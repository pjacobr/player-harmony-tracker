import { RectangleProps } from "recharts";

export const WhiskerLine = (props: RectangleProps) => {
  const { x, y, width, height } = props;
  if (x == null || y == null || width == null || height == null) return null;

  return (
    <line
      x1={x + width / 2}
      y1={y + height}
      x2={x + width / 2}
      y2={y}
      stroke="#E5DEFF"
      strokeWidth={1}
      strokeDasharray="4"
    />
  );
};