import { NOTIFICATION_TYPE } from "../lib/types";
import "./notification.css";

const DELETE_NOTIFICATION_TIMEOUT = 7_000;

export default function Notification({
  title,
  message,
  type,
  id,
}: {
  title: string;
  message: string;
  type: NOTIFICATION_TYPE;
  id: number;
}) {
  const handleRemove = () => {
    const e = document.querySelector(`#notification-${id}`)!;
    if (e) e.classList.add("notification-remove");
    setTimeout(() => {
      if (e) e.remove();
    }, 500);
  };

  setTimeout(handleRemove, DELETE_NOTIFICATION_TIMEOUT);

  return (
    <div
      className={`notification-item ${type.toLowerCase()}`}
      id={`notification-${id}`}
      onClick={handleRemove}
    >
      <h4>
        {type.toUpperCase()}: {title.toUpperCase()}
      </h4>
      <p>{message}</p>
    </div>
  );
}
