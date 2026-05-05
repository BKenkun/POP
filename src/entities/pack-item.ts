// A simpler type for passing pack info to the server action
export interface PackItemBrief {
    id: string;
    name: string;
    quantity: number;
}

export interface PackCalculationOutput {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
}