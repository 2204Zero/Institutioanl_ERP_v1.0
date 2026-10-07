export interface Department {
  id: number;
  name: string;
  code: string;
  campusId?: number;
}

export interface DepartmentCreateRequest {
  name: string;
  code: string;
  campusId?: number;
}
