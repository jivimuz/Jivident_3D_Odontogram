export const TOOTH_MESH_NAME_MAP_CHILD: { [key: string]: string } = {
  Gums_Maxilla001_0: "Gums Maxilla",
  Gums_Mandibula001_0: "Gums Mandibulla",
  A_0: "(Left Top) Molar",
  B_0: "(Left Top) Premolar",
  C_0: "(Left Top) Canine",
  D_0: "(Left Top) Lateral",
  E_0: "(Left Top) Central",
  F_0: "(Right Top) Central",
  G_0: "(Right Top) Lateral",
  H_0: "(Right Top) Canine",
  I_0: "(Right Top) Premolar",
  J_0: "(Right Top) Molar",
  K_0: "(Left Bottom) Molar",
  L_0: "(Left Bottom) Premolar",
  M_0: "(Left Bottom) Canine",
  N_0: "(Left Bottom) Lateral",
  O_0: "(Left Bottom) Central",
  P_0: "(Right Bottom) Central",
  Q_0: "(Right Bottom) Lateral",
  R_0: "(Right Bottom) Canine",
  S_0: "(Right Bottom) Premolar",
  T_0: "(Right Bottom) Molar",
};

export const TOOTH_MESH_NAME_MAP_ADULT: { [key: string]: string } = {
  // --- Rahang Atas Kanan (Quadrant 1) ---
  "Box023_01_-_Default_0": "11 (Right Top) Central Incisor",
  "Box024_01_-_Default_0": "12 (Right Top) Lateral Incisor",
  "Box025_01_-_Default_0": "13 (Right Top) Canine",
  "Box031_01_-_Default_0": "14 (Right Top) First Premolar",
  "Box033_01_-_Default_0": "15 (Right Top) Second Premolar",
  "Box032_01_-_Default_0": "16 (Right Top) First Molar",
  "Box035_01_-_Default_0": "17 (Right Top) Second Molar",
  "Box034_01_-_Default_0": "18 (Right Top) Third Molar",

  // --- Rahang Atas Kiri (Quadrant 2) ---
  "Box020_01_-_Default_0": "21 (Left Top) Central Incisor",
  "Box021_01_-_Default_0": "22 (Left Top) Lateral Incisor",
  "Box022_01_-_Default_0": "23 (Left Top) Canine",
  "Box026_01_-_Default_0": "24 (Left Top) First Premolar",
  "Box028_01_-_Default_0": "25 (Left Top) Second Premolar",
  "Box027_01_-_Default_0": "26 (Left Top) First Molar",
  "Box030_01_-_Default_0": "27 (Left Top) Second Molar",
  "Box029_01_-_Default_0": "28 (Left Top) Third Molar",

  // --- Rahang Bawah Kiri (Quadrant 3) ---
  "Box011_01_-_Default_0": "38 (Left Bottom) Third Molar",
  "Box013_01_-_Default_0": "37 (Left Bottom) Second Molar",
  "Box008_01_-_Default_0": "36 (Left Bottom) First Molar",
  "Box009_01_-_Default_0": "35 (Left Bottom) Second Premolar",
  "Box007_01_-_Default_0": "34 (Left Bottom) First Premolar",
  "Box003_01_-_Default_0": "33 (Left Bottom) Canine",
  "Box002_01_-_Default_0": "32 (Left Bottom) Lateral Incisor",
  "Box001_01_-_Default_0": "31 (Left Bottom) Central Incisor",

  // --- Rahang Bawah Kanan (Quadrant 4) ---
  "Box004_01_-_Default_0": "41 (Right Bottom) Central Incisor",
  "Box005_01_-_Default_0": "42 (Right Bottom) Lateral Incisor",
  "Box006_01_-_Default_0": "43 (Right Bottom) Canine",
  "Box015_01_-_Default_0": "44 (Right Bottom) First Premolar",
  "Box017_01_-_Default_0": "45 (Right Bottom) Second Premolar",
  "Box016_01_-_Default_0": "46 (Right Bottom) First Molar",
  "Box019_01_-_Default_0": "47 (Right Bottom) Second Molar",
  "GeoSphere001_01_-_Default_0": "48 (Right Bottom) Third Molar",

  // --- Lain-lain ---
  "Tube002_07_-_Default_0": "(Top Tube) Gums Maxilla",
  "Tube001_07_-_Default_0": "(Bottom Tube) Gums Mandibula",
  "lingua_02_-_Default_0": "(Tongue) Lingua",
};

export function mapForToothType(toothType: string): { [key: string]: string } {
  return toothType === "child" || !toothType
    ? TOOTH_MESH_NAME_MAP_CHILD
    : TOOTH_MESH_NAME_MAP_ADULT;
}
