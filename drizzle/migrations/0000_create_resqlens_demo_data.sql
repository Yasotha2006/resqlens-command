CREATE TABLE public.resqlens_scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('High','Medium','Low','Resolved')),
  confidence INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resqlens_scenarios TO anon, authenticated;
GRANT ALL ON public.resqlens_scenarios TO service_role;
ALTER TABLE public.resqlens_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo scenarios are publicly readable" ON public.resqlens_scenarios FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.resqlens_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id TEXT NOT NULL REFERENCES public.resqlens_scenarios(id),
  location TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('High','Medium','Low','Resolved')),
  occurred_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  note TEXT NOT NULL
);
GRANT SELECT ON public.resqlens_incidents TO anon, authenticated;
GRANT ALL ON public.resqlens_incidents TO service_role;
ALTER TABLE public.resqlens_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Demo incidents are publicly readable" ON public.resqlens_incidents FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.resqlens_copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token_hash TEXT NOT NULL UNIQUE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.resqlens_copilot_sessions TO service_role;
ALTER TABLE public.resqlens_copilot_sessions ENABLE ROW LEVEL SECURITY;

INSERT INTO public.resqlens_scenarios (id, name, location, severity, confidence, summary) VALUES
('pathway-obstruction','Emergency Pathway Obstruction','Building A / Floor 2 / Exit B','High',94,'Potential evacuation delay caused by an object partially obstructing the primary egress route.'),
('restricted-intrusion','Restricted Area Intrusion','Hazard Zone A / Perimeter 03','High',91,'Possible unauthorized entry detected within a controlled safety perimeter.'),
('crowd-accumulation','Crowd Accumulation','Concourse South / Junction 4','Medium',87,'Estimated crowd density is rising near a narrow circulation point.'),
('person-down','Person-Down / Possible Emergency Event','Medical Station / East Corridor','High',89,'A possible person-down event may require rapid human verification and medical response.');

INSERT INTO public.resqlens_incidents (scenario_id, location, severity, occurred_at, status, note) VALUES
('pathway-obstruction','Building A / Floor 2 / Exit B','High','2026-09-19T10:42:00Z','Active','Maintenance cart detected within the estimated egress envelope.'),
('pathway-obstruction','Building A / Floor 2 / Exit B','Resolved','2026-09-12T14:18:00Z','Resolved','Similar obstruction cleared after facilities notification.'),
('pathway-obstruction','Building A / Floor 2 / Exit B','Medium','2026-09-05T08:33:00Z','Resolved','Temporary delivery materials narrowed the exit approach.'),
('restricted-intrusion','Hazard Zone A / Perimeter 03','High','2026-09-18T21:06:00Z','Review','Possible perimeter breach requires guard verification.'),
('crowd-accumulation','Concourse South / Junction 4','Medium','2026-09-17T17:24:00Z','Monitoring','Estimated density exceeded the observation threshold.'),
('person-down','Medical Station / East Corridor','Resolved','2026-09-14T09:12:00Z','Resolved','Responder confirmed a non-emergency maintenance activity.');