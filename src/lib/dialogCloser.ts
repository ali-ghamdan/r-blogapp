import { MouseEvent } from "react";

// https://stackoverflow.com/a/57463812/17065740
export default function dialogCloser(e: MouseEvent) {
  if ((e.target as HTMLElement)?.tagName?.toUpperCase?.() !== "DIALOG") return;
  const rect = (e.target as HTMLDialogElement).getBoundingClientRect();

    const clickedInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
    );

    if (clickedInDialog === false)
      (e.target as HTMLDialogElement).close();
}