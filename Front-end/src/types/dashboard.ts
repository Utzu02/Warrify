export interface Warranty {
  id: string;
  productName: string;
  purchaseDate: string | null;
  expirationDate: string | null;
  provider: string;
  filename: string;
  size: number;
}

export interface FilterOption {
  label: string;
  value: string | number;
}
