import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Palette, Copy } from "lucide-react";

type TimeSlot = {
  day: number;
  hour: number;
  minute: number;
  activity: string;
  color: string;
};

interface CronogramaCellProps {
  day: number;
  hour: number;
  minute: number;
  slot: TimeSlot;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onActivityChange: (activity: string) => void;
  onColorPickerOpen: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  hasCopiedCell: boolean;
}

/**
 * Componente de célula do cronograma otimizado com React.memo
 * 
 * Só re-renderiza quando suas props mudam, evitando que todas as 336 células
 * sejam re-renderizadas quando apenas uma muda.
 */
const CronogramaCell = memo(function CronogramaCell({
  slot,
  isEditing,
  onStartEdit,
  onStopEdit,
  onActivityChange,
  onColorPickerOpen,
  onCopy,
  onPaste,
  onDragStart,
  onDrop,
  hasCopiedCell,
}: CronogramaCellProps) {
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasCopiedCell) {
      onPaste();
    } else {
      onCopy();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      onStopEdit();
    }
  };

  return (
    <td
      className="border-2 border-border p-0 h-12 relative group transition-all hover:shadow"
      style={{ backgroundColor: slot.color }}
      draggable={!isEditing && slot.activity !== ""}
      onDragStart={onDragStart}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      onContextMenu={handleContextMenu}
    >
      {isEditing ? (
        <Input
          autoFocus
          value={slot.activity}
          onChange={(e) => onActivityChange(e.target.value)}
          onBlur={onStopEdit}
          onKeyDown={handleKeyDown}
          className="h-full border-0 text-xs p-2 font-semibold"
          style={{ backgroundColor: slot.color }}
        />
      ) : (
        <div
          onClick={onStartEdit}
          className="h-full w-full p-2 text-xs cursor-pointer flex items-center justify-between font-semibold"
        >
          <span className="truncate flex-1">{slot.activity}</span>
          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onColorPickerOpen();
              }}
              className="p-1 hover:bg-black/20 dark:hover:bg-white/20 rounded transition-colors"
            >
              <Palette className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="p-1 hover:bg-black/20 dark:hover:bg-white/20 rounded transition-colors"
              title="Copiar"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </td>
  );
});

export default CronogramaCell;
