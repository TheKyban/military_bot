export const emergencyCategories = [
  "Medical Emergency",
  "Hostile Contact",
  "Equipment Failure",
  "Navigation Issues",
  "Communication Loss",
  "Environmental Hazards",
];

export const initialSuggestions: Record<string, string[]> = {
  "Medical Emergency": [
    "Severe bleeding from combat injury",
    "Heat exhaustion symptoms",
    "Suspected fracture from fall",
    "Combat stress reaction",
    "Dehydration symptoms",
  ],
  "Hostile Contact": [
    "Enemy sniper spotted",
    "Suspected IED location",
    "Ambush in progress",
    "Civilian presence in combat zone",
    "Unknown vehicle approaching checkpoint",
  ],
  "Equipment Failure": [
    "Radio communication device malfunction",
    "Night vision equipment failure",
    "Vehicle breakdown in hostile area",
    "Weapon system malfunction",
    "GPS system failure",
  ],
  "Navigation Issues": [
    "Lost in unknown territory",
    "GPS signal lost",
    "Unable to reach checkpoint",
    "Terrain obstacles blocking planned route",
    "Lost contact with patrol team",
  ],
  "Communication Loss": [
    "Complete radio silence",
    "Satellite communication failure",
    "Lost contact with base",
    "Signal jamming detected",
    "Emergency beacon malfunction",
  ],
  "Environmental Hazards": [
    "Extreme weather conditions",
    "Hazardous material exposure",
    "Flash flood warning",
    "Wildfire in operational area",
    "Chemical contamination suspected",
  ],
};
