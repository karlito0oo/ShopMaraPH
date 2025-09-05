declare module 'ph-locations' {
  interface Region {
    code: string;
    name: string;
    altName?: string;
    nameTL: string;
  }

  interface Province {
    code: string;
    name: string;
    altName?: string;
    nameTL: string;
    region: string;
  }

  interface CityMunicipality {
    name: string;
    fullName: string;
    altName?: string;
    province: string;
    classification: string;
    isCapital: boolean;
  }

  export const provinces: Province[];
  export const citiesMunicipalities: CityMunicipality[];
  export const regions: Region[];
}
