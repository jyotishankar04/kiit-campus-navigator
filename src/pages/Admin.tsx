import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/useLocations';
import { Location, LocationCategory, CATEGORY_CONFIG, CAMPUS_CENTER } from '@/types/location';
import { CampusMap } from '@/components/map/CampusMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Plus, Pencil, Trash2, LogOut, ArrowLeft, Download, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LocationFormData {
  name: string;
  lat: number;
  lng: number;
  category: LocationCategory;
  description: string;
  photo_url: string;
}

const defaultFormData: LocationFormData = {
  name: '',
  lat: CAMPUS_CENTER.lat,
  lng: CAMPUS_CENTER.lng,
  category: 'academic',
  description: '',
  photo_url: '',
};

export default function Admin() {
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { data: locations = [], isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LocationFormData>(defaultFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleMapClick = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    const locationData = {
      name: formData.name.trim(),
      lat: formData.lat,
      lng: formData.lng,
      category: formData.category,
      description: formData.description.trim() || null,
      photo_url: formData.photo_url.trim() || null,
    };

    if (editingId) {
      await updateLocation.mutateAsync({ id: editingId, ...locationData });
    } else {
      await createLocation.mutateAsync(locationData);
    }

    setFormData(defaultFormData);
    setEditingId(null);
    setDialogOpen(false);
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      lat: location.lat,
      lng: location.lng,
      category: location.category,
      description: location.description || '',
      photo_url: location.photo_url || '',
    });
    setEditingId(location.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteLocation.mutateAsync(id);
  };

  const handleExport = () => {
    const data = JSON.stringify(locations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kiit-locations.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Locations exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        
        for (const loc of imported) {
          if (loc.name && loc.lat && loc.lng && loc.category) {
            await createLocation.mutateAsync({
              name: loc.name,
              lat: loc.lat,
              lng: loc.lng,
              category: loc.category,
              description: loc.description || null,
              photo_url: loc.photo_url || null,
            });
          }
        }
        toast.success(`Imported ${imported.length} locations`);
      } catch {
        toast.error('Failed to import: Invalid JSON format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Actions */}
        <div className="flex flex-wrap z-50 gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setFormData(defaultFormData); setEditingId(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Location' : 'Add New Location'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Central Library"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData((p) => ({ ...p, lat: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData((p) => ({ ...p, lng: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData((p) => ({ ...p, category: v as LocationCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of this location..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createLocation.isPending || updateLocation.isPending}>
                  {(createLocation.isPending || updateLocation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingId ? 'Update Location' : 'Add Location'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </Button>
        </div>

        {/* Map preview */}
        <Card className="z-0">
          <CardHeader>
            <CardTitle className="text-base">Map Preview (Click to add location)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 md:h-80">
              <CampusMap
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
                onMapClick={handleMapClick}
                isAdmin
              />
            </div>
          </CardContent>
        </Card>

        {/* Locations table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isLoading ? 'Loading...' : `${locations.length} Locations`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Coordinates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => {
                    const config = CATEGORY_CONFIG[location.category];
                    return (
                      <TableRow key={location.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{config.icon}</span>
                            <span className="font-medium">{location.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{config.label}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(location)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Location?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{location.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(location.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}