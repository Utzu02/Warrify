export interface NotificationMeta {
  warrantyId?: string | number;
  [key: string]: any;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  isRead?: boolean;
  meta?: NotificationMeta;
  createdAt: string;
}
