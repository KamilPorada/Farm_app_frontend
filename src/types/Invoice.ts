export type Invoice = {
  id: number;
  farmerId: number;
  pointOfSaleId: number;
  invoiceDate: string; // YYYY-MM-DD
  invoiceNumber: string;
  amount: number;
  status: boolean; // false = oczekująca, true = zrealizowana
};
