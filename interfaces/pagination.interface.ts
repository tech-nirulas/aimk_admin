export interface RootPaginate<T> {
  status: boolean;
  message: string;
  data: T[];
  meta: Meta;
}

export interface Meta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
