export interface ITutorFilters {
  search?: string;
}

export interface IUpsertTutorProfile {
  displayName: string;
  qualifications: string[];
  experiences: string[];
}

export interface ITutorQueryRequest {
  skip: number;
  take: number;
  search?: string;
}
