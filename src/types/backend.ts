// types/backend.ts

/* ===== Farmer ===== */
export interface Farmer {
    id: number;
    externalId: string;
    name: string | null;
    surname: string | null;
    email: string;
  }
  
  /* ===== FarmerDetails ===== */
  export interface FarmerDetails {
    id: number;
    farmerId: number;
    voivodeship: string;
    district: string | null;
    commune: string | null;
    locality: string | null;
    farmAreaHa: string | null; // BigDecimal -> string
    settlementType: string;
    crops: string | null;
  }
  
  /* ===== FarmerTunnels ===== */
  export interface FarmerTunnel {
    id: number;
    farmerId: number;
    year: number;
    tunnelsCount: string; // BigDecimal -> string
  }
  
  /* ===== AppSettings ===== */
  export interface AppSettings {
    id: number;
    farmerId: number;
  
    language: string;
    weightUnit: string;
    currency: string;
    dateFormat: string;
  
    useThousandsSeparator: boolean;
    boxWeightKg: string | null; // BigDecimal
    notificationsEnabled: boolean;
  }
  