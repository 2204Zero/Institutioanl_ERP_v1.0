export interface InstitutionCreateRequest {
  name: string;
  code: string;
}

export interface InstitutionResponse {
  id: number;
  name: string;
  code: string;
}

export interface CampusCreateRequest {
  name: string;
  address: string;
  institutionId: number;
}

export interface CampusResponse {
  id: number;
  name: string;
  address: string;
  institutionId: number;
}
