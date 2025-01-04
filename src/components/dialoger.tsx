import { lazy, Suspense } from "react";
import dialogCloser from "../lib/dialogCloser";
import Loading from "./loading";
import { dialogStore } from "../lib/stores";
import { dialogPage } from "../lib/types";

export default function Dialoger() {
  const dialog = dialogStore((state) => state.dialog);
  const DialogComponent = lazy(() => {
    if (dialog === dialogPage.SHOW_FEEDS) {
      return import("../dialogs/ShowFeeds");
    } else if (dialog === dialogPage.SHOW_MY_POSTS) {
      return import("../dialogs/ShowMyPosts");
    } else {
      return import("../dialogs/createNewPost");
    }
  });
  return (
    <dialog
      id="main-dialog"
      onClick={dialogCloser}
      data-dialog={String(dialog)}
    >
      <Suspense fallback={<Loading />}>
        <DialogComponent />
      </Suspense>
    </dialog>
  );
}
