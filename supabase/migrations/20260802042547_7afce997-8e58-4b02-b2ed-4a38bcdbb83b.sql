CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  visit_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_party_size_check CHECK (party_size >= 1 AND party_size <= 8),
  ADD CONSTRAINT reservations_name_check CHECK (char_length(name) BETWEEN 1 AND 50),
  ADD CONSTRAINT reservations_phone_check CHECK (char_length(phone) BETWEEN 6 AND 30),
  ADD CONSTRAINT reservations_note_check CHECK (note IS NULL OR char_length(note) <= 300),
  ADD CONSTRAINT reservations_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled'));

GRANT INSERT ON public.reservations TO anon, authenticated;
GRANT ALL ON public.reservations TO service_role;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a reservation"
  ON public.reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');