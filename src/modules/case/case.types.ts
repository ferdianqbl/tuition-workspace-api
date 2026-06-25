import { CaseStatus } from "@prisma/client";

export interface ICaseFilters {
  search?: string;
  subject?: string;
  level?: string;
  status?: CaseStatus;
}

export interface ICreateCaseRequest {
  title: string;
  subject: string;
  level: string;
  location: string;
  budgetPerHour: number;
}

export interface IUpdateCaseRequest {
  title?: string;
  subject?: string;
  level?: string;
  location?: string;
  budgetPerHour?: number;
  status?: CaseStatus;
}

export interface ICaseQueryRequest {
  skip: number;
  take: number;
  filters?: ICaseFilters;
}
