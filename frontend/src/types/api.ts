type ApiErrorPayload = {
  code?: number;
  message?: string;
  validationErrors?: string[] | Record<string, string[]>;
};

export type ApiResponse<T> = {
  successful: boolean;
  data?: T;
  error?: ApiErrorPayload;
};

export type PageInfo = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type PagedResult<T> = {
  data: T[];
  paging: PageInfo;
};
