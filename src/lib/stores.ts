import { create } from "zustand";
import { authState, dialogState, notificationState } from "./types";

export const authStore = create<authState>((set) => {
    const accessToken = localStorage.getItem("userAccessToken");
    return {
        auth: accessToken,
        setAuth: (accessToken) => {
            set({ auth: accessToken });
            if (accessToken) {
                localStorage.setItem("userAccessToken", accessToken);
            } else {
                localStorage.removeItem("userAccessToken");
            }
        }
    }
})

export const dialogStore = create<dialogState>((set) => {
    return {
        dialog: null,
        setDialog: (dialog) => {
            set({ dialog });
            (document.querySelector(".profile-dialog") as HTMLDialogElement)?.close();
            (document.querySelector("dialog#main-dialog") as HTMLDialogElement)?.showModal()
        }
    }
})

export const notificationsStore = create<notificationState>((set) => {
    return {
        notifications: [],
        addNotification: (notification) => {
            set((state) => {
              return {
                notifications: [...state.notifications, notification]
              }
            })
        }
    }
})