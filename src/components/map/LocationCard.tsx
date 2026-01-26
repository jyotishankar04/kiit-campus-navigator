import { Location, CATEGORY_CONFIG } from '@/types/location';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  location: Location;
  onClose: () => void;
  onNavigate?: () => void;
}

export function LocationCard({ location, onClose, onNavigate }: LocationCardProps) {
  const config = CATEGORY_CONFIG[location.category];

  return (
    <Card className="animate-fade-in glass">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xl",
              `bg-${config.color}/20`
            )}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{location.name}</h3>
              <p className={cn("text-sm", `text-${config.color}`)}>{config.label}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {location.description && (
          <p className="mt-3 text-sm text-muted-foreground">{location.description}</p>
        )}
        
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
        </div>

        {onNavigate && (
          <Button 
            onClick={onNavigate}
            className="w-full mt-4"
            size="sm"
          >
            Get Directions
          </Button>
        )}
      </CardContent>
    </Card>
  );
}