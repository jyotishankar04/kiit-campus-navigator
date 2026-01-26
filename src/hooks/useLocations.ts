import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Location, LocationCategory } from '@/types/location';
import { toast } from 'sonner';

export function useLocations(search?: string, category?: LocationCategory | null) {
  return useQuery({
    queryKey: ['locations', search, category],
    queryFn: async () => {
      let query = supabase.from('locations').select('*');
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as Location[];
    },
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add location: ' + error.message);
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...location }: Partial<Location> & { id: string }) => {
      const { data, error } = await supabase
        .from('locations')
        .update(location)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update location: ' + error.message);
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete location: ' + error.message);
    },
  });
}