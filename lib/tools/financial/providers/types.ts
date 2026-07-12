import { FinancialData } from "../../../../types";

export interface FinancialProvider {
  name: string;
  fetchData(ticker: string): Promise<Partial<FinancialData> | null>;
}
