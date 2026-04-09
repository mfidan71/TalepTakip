import { lazy, Suspense, ReactNode, useState } from "react";
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BOARD_ICONS, BoardIconName } from "@/lib/boardIcons";
import { cn } from "@/lib/utils";

const iconCache: Record<string, React.LazyExoticComponent<React.FC<LucideProps>>> = {};

function getLazyIcon(name: string) {
  if (!iconCache[name]) {
    const importFn = dynamicIconImports[name as keyof typeof dynamicIconImports];
    if (!importFn) return null;
    iconCache[name] = lazy(importFn);
  }
  return iconCache[name];
}

export const DynamicBoardIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  const Icon = getLazyIcon(name);
  if (!Icon) return <span className={props.className}>?</span>;
  return (
    <Suspense fallback={<span className={props.className} />}>
      <Icon {...props} />
    </Suspense>
  );
};

interface BoardIconPickerProps {
  value: BoardIconName;
  onChange: (icon: BoardIconName) => void;
  trigger?: ReactNode;
}

export const BoardIconPicker = ({ value, onChange, trigger }: BoardIconPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 h-9" type="button">
            <DynamicBoardIcon name={value} className="h-4 w-4" />
            <span className="text-xs">İkon Değiştir</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-medium text-muted-foreground mb-2">İkon Seçin</p>
        <div className="grid grid-cols-6 gap-1">
          {BOARD_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-lg transition-colors hover:bg-accent",
                value === icon && "bg-primary/10 text-primary ring-1 ring-primary/30"
              )}
              onClick={() => {
                onChange(icon);
                setOpen(false);
              }}
            >
              <DynamicBoardIcon name={icon} className="h-5 w-5" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
