export type FinancialDecreaseType = {
  id: number;
  farmerId: number;
  name: string;
  seasonYear: number;
};

export type CreateFinancialDecreaseType = {
  farmerId: number;
  name: string;
  seasonYear: number;
};

export type FinancialDecrease = {
  id: number;
  farmerId: number;
  typeId: number;
  typeName: string;
  title: string;
  amount: number;
};

export type CreateFinancialDecrease = {
  farmerId: number;
  typeId: number;
  title: string;
  amount: number;
};

export type FinancialIncreaseType = {
  id: number;
  farmerId: number;
  name: string;
  seasonYear: number;
};

export type CreateFinancialIncreaseType = {
  farmerId: number;
  name: string;
  seasonYear: number;
};

export type FinancialIncrease = {
  id: number;
  farmerId: number;
  typeId: number;
  typeName: string;
  title: string;
  amount: number;
};

export type CreateFinancialIncrease = {
  farmerId: number;
  typeId: number;
  title: string;
  amount: number;
};
