import { LocationCategory, CATEGORY_CONFIG } from '@/types/location';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selected: LocationCategory | null;
  onChange: (category: LocationCategory | null) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const categories = Object.entries(CATEGORY_CONFIG) as [LocationCategory, typeof CATEGORY_CONFIG[LocationCategory]][];

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(null)}
        className="rounded-full"
      >
        All
      </Button>
      {categories.map(([key, config]) => (
        <Button
          key={key}
          variant={selected === key ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(selected === key ? null : key)}
          className={cn(
            "rounded-full gap-1",
            selected === key && `bg-${config.color} hover:bg-${config.color}/90`
          )}
        >
          <span>{config.icon}</span>
          <span className="hidden sm:inline">{config.label}</span>
        </Button>
      ))}
    </div>
  );
}