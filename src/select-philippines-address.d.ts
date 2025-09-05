declare module 'select-philippines-address' {
  interface Region {
    id: string;
    psgc_code: string;
    region_name: string;
    region_code: string;
  }

  interface Province {
    psgc_code: string;
    province_name: string;
    province_code: string;
    region_code: string;
  }

  interface City {
    city_name: string;
    city_code: string;
    province_code: string;
    region_desc: string;
  }

  interface Barangay {
    brgy_name: string;
    brgy_code: string;
    province_code: string;
    region_code: string;
  }

  export function regions(): Promise<Region[]>;
  export function regionByCode(code: string): Promise<Region>;
  export function provinces(regionCode: string): Promise<Province[]>;
  export function provincesByCode(code: string): Promise<Province[]>;
  export function provinceByName(name: string): Promise<Province>;
  export function cities(provinceCode: string): Promise<City[]>;
  export function barangays(cityCode: string): Promise<Barangay[]>;
}
