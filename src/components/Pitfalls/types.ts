export interface PitfallItem {
  symptom: string;
  why: string;
  fix: string;
}

export interface PitfallsProps {
  items: PitfallItem[];
}