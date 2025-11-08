export interface Warranty {
  id: string;
  productName: string;
  purchaseDate: string | null;
  expirationDate: string | null;
  provider: string;
  filename: string;
  size: number;
}
