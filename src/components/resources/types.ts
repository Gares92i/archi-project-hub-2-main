
export interface Resource {
  id: string;
  name: string;
  type: "document" | "image" | "video" | "archive" | "other";
  category: "templates" | "standards" | "materials" | "tutorials" | "software";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
}
