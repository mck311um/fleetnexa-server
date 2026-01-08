export interface CSCCountry {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numeric_code?: string;
  phonecode: string;
  capital: string;
  currency: string;
  currency_name?: string;
  currency_symbol?: string;
  tld?: string;
  native: string;
  region?: string;
  region_id?: number;
  subregion?: string;
  subregion_id?: number;
  nationality?: string;
}
