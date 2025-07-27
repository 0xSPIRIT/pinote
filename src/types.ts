export enum ItemType {
  Directory,
  File
};

export type DirectoryItem = {
  type: ItemType;
  name: string;
  children?: DirectoryItem[];
  count: number;
};
