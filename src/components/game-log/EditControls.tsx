import { Button } from "@/components/ui/button";
import { Save, X, Edit2 } from "lucide-react";

interface EditControlsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  isPending?: boolean;
}

export function EditControls({ isEditing, onSave, onCancel, onEdit, isPending }: EditControlsProps) {
  return (
    <div className="flex gap-2">
      {isEditing ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSave}
            disabled={isPending}
            className="h-8 w-8"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isPending}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}