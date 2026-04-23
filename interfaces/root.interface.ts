export interface Root<T> {
  data: T | null;
  status: boolean;
  message: string;
}

export interface ErrorResponse {
  data: {
    status: boolean;
    message: string;
    error: string;
  };
}
