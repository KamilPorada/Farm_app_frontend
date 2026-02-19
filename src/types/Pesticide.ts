export type PesticideType = {
  id: number;
  farmerId: number;
  name: string;
  icon? : string;
};

export type Pesticide = {
  id: number;
  farmerId: number;
  pesticideTypeId: number;
  name: string;
  isLiquid: boolean;
  targetPest: string;
  carenceDays: number;
};
