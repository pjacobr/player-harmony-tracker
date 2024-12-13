import { Input } from "@/components/ui/input";

interface ScoreInputProps {
  label: string;
  value: number;
  isEditing: boolean;
  onChange: (value: string) => void;
}

export function ScoreInput({ label, value, isEditing, onChange }: ScoreInputProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-gaming-muted text-sm">{label}</span>
      {isEditing ? (
        <Input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-8 text-center"
        />
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}