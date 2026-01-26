import { Location, CATEGORY_CONFIG } from '@/types/location';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LocationListProps {
  locations: Location[];
  selectedId: string | null;
  onSelect: (location: Location) => void;
}

export function LocationList({ locations, selectedId, onSelect }: LocationListProps) {
  if (locations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No locations found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-1 p-2">
        {locations.map((location) => {
          const config = CATEGORY_CONFIG[location.category];
          const isSelected = location.id === selectedId;
          
          return (
            <button
              key={location.id}
              onClick={() => onSelect(location)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                isSelected 
                  ? "bg-primary/10 border border-primary/20" 
                  : "hover:bg-muted"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0",
                `bg-${config.color}/20`
              )}>
                {config.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{location.name}</p>
                <p className={cn("text-xs", `text-${config.color}`)}>{config.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}