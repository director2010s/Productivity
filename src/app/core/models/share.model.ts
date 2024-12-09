export type SharePermission = 'view' | 'edit' | 'admin';

export interface ShareSettings {
  id: string;
  resourceId: string;
  resourceType: 'note' | 'task' | 'journal';
  sharedWith: {
    email: string;
    permission: SharePermission;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationUser {
  id: string;
  email: string;
  name?: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
  };
}