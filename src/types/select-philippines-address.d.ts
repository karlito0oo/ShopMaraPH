declare module 'select-philippines-address' {
  interface Province {
    province_code: string;
    province_name: string;
  }

  interface City {
    city_code: string;
    city_name: string;
    province_code: string;
  }

  interface Barangay {
    brgy_code: string;
    brgy_name: string;
    city_code: string;
  }

  export function getProvinces(): Promise<Province[]>;
  export function getCities(provinceName: string): Promise<City[]>;
  export function getBarangays(cityName: string): Promise<Barangay[]>;
}
