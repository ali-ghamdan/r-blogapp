import { Navigate } from "react-router-dom";
import { notificationsStore } from "../lib/stores";

export default function NotFound() {
  const sendNotification = notificationsStore((state) => state.addNotification);
  sendNotification({
    type: "INFO",
    title: "DID YOU LOST?",
    message: "Ok You are now at the home.",
  });
  return <Navigate to="/" />;
}
