-- Create locations table for campus markers
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'hostel', 'food', 'medical')),
  description TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view locations)
CREATE POLICY "Locations are viewable by everyone" 
ON public.locations 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to manage locations (admin)
CREATE POLICY "Authenticated users can insert locations" 
ON public.locations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update locations" 
ON public.locations 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete locations" 
ON public.locations 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial campus locations
INSERT INTO public.locations (name, lat, lng, category, description) VALUES
  ('Central Library', 20.3532, 85.8180, 'academic', 'Main library with 24/7 reading rooms and digital resources'),
  ('School of CSE', 20.3540, 85.8200, 'academic', 'Computer Science & Engineering department'),
  ('King''s Palace Hostel', 20.3520, 85.8170, 'hostel', 'Premium boys hostel with modern amenities'),
  ('KIMS Hospital', 20.3534, 85.8154, 'medical', 'Kalinga Institute of Medical Sciences - 24/7 emergency'),
  ('KISS Main Gate', 20.3528, 85.8194, 'academic', 'Kalinga Institute of Social Sciences entrance'),
  ('Exam Hall A', 20.3538, 85.8198, 'academic', 'Main examination center'),
  ('Food Court', 20.3525, 85.8185, 'food', 'Central food court with multiple cuisines'),
  ('School of Biotechnology', 20.3545, 85.8175, 'academic', 'Biotechnology and Bioinformatics department'),
  ('Girls Hostel Complex', 20.3515, 85.8190, 'hostel', 'Secure girls hostel with 24/7 security'),
  ('Campus Cafeteria', 20.3530, 85.8195, 'food', 'Quick bites and beverages'),
  ('Medical Center', 20.3535, 85.8165, 'medical', 'On-campus health center for students'),
  ('Auditorium', 20.3542, 85.8188, 'academic', 'Main auditorium for events and seminars'),
  ('Sports Complex', 20.3548, 85.8178, 'academic', 'Indoor and outdoor sports facilities'),
  ('Boys Hostel Block C', 20.3518, 85.8175, 'hostel', 'Boys hostel with study rooms'),
  ('Domino''s Pizza', 20.3522, 85.8182, 'food', 'Popular pizza outlet on campus');