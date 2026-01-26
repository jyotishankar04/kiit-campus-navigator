import { useState } from 'react';
import { useLocations } from '@/hooks/useLocations';
import { Location, LocationCategory } from '@/types/location';
import { CampusMap } from '@/components/map/CampusMap';
import { SearchBar } from '@/components/map/SearchBar';
import { CategoryFilter } from '@/components/map/CategoryFilter';
import { LocationCard } from '@/components/map/LocationCard';
import { LocationList } from '@/components/map/LocationList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<LocationCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: locations = [], isLoading } = useLocations(search, category);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm px-4 py-3 z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4 border-b">
                  <h2 className="font-semibold">Locations</h2>
                </div>
                <LocationList
                  locations={locations}
                  selectedId={selectedLocation?.id ?? null}
                  onSelect={(loc) => {
                    setSelectedLocation(loc);
                    setSidebarOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">KIIT Navigator</h1>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/admin">
              <Button variant="outline" size="icon" className="rounded-full">
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-3 md:hidden">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Category filters */}
        <div className="mt-3">
          <CategoryFilter selected={category} onChange={setCategory} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-80 border-r border-border/50 bg-card/50">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              {isLoading ? 'Loading...' : `${locations.length} Locations`}
            </h2>
          </div>
          <LocationList
            locations={locations}
            selectedId={selectedLocation?.id ?? null}
            onSelect={setSelectedLocation}
          />
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <CampusMap
            locations={locations}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />

          {/* Selected location card */}
          {selectedLocation && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-10">
              <LocationCard
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/80 backdrop-blur-sm px-4 py-2 text-center text-xs text-muted-foreground">
        Built with ❤️ for KIIT University • © 2026 KIIT Navigator
      </footer>
    </div>
  );
}