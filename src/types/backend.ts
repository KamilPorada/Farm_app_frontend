export interface Farmer {
    id: number;
    externalId: string;
    name: string | null;
    surname: string | null;
    email: string;
  }
  
  export interface FarmerDetails {
    id: number;
    farmerId: number;
    voivodeship: string;
    district: string | null;
    commune: string | null;
    locality: string | null;
    farmAreaHa: string | null; 
    settlementType: string;
    crops: string | null;
  }
  
  export interface FarmerTunnel {
    id: number;
    farmerId: number;
    year: number;
    count: string; 
  }
  
  export interface AppSettings {
    id: number;
    farmerId: number;
    language: string;
    weightUnit: string;
    currency: string;
    dateFormat: string;
    useThousandsSeparator: boolean;
    boxWeightKg: string | null;
    notificationsEnabled: boolean;
  }
  