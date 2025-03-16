export interface ModelData {
  [key: string]: string;
}

export interface SortConfig {
  key: keyof ModelData;
  direction: 'asc' | 'desc';
}

export type SortableKeys = Array<{
  key: keyof ModelData;
  label: string;
  numeric?: boolean;
}>;