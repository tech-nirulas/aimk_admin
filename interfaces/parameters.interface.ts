export interface Parameters {
  sort?: string;
  "pagination[withCount]"?: boolean;
  "pagination[page]"?: number;
  "pagination[pageSize]"?: number;
  "pagination[start]"?: number;
  "pagination[limit]"?: number;
  fields?: string;
  [key: `populate[${string}]`]: boolean;
  filters?: {
    [key: string]: {
      $eq: string;
    };
  };
  locale?: string;
}
