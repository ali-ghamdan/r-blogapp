export interface authState {
  auth: string | undefined | null;
  setAuth: (accessToken: string | undefined | null) => void;
}

export enum dialogPage {
  CREATE_NEW_POST = 1,
  SHOW_MY_POSTS = 2,
  SHOW_FEEDS = 3,
}

export interface dialogState {
  dialog: dialogPage | null;
  setDialog: (dialog: dialogPage) => void;
}

export type NOTIFICATION_TYPE = "SUCCESS" | "INFO" | "WARN" | "ERROR";

export interface notificationData {
  title: string;
  message: string;
  type: NOTIFICATION_TYPE;
}

export interface notificationState {
  notifications: Array<notificationData>;
  addNotification: (notification: notificationData) => void;
}

export interface PostCardData {
  id: string;
  title: string;
  commentsCount: number;
  createdAt: string;
  isLikedByAuthorizedUser: boolean;
  likes: number;
  updatedAt: string;
  poster: {
    username: string;
    id: string;
    postsCount: number;
    followingCount: string;
    followersCount: string;
    avatar?: string;
    createdAt: string;
  };
}
