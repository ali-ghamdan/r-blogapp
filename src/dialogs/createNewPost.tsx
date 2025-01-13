import { FormEvent, useState } from "react";
import "./createNewPost.css";
import { authStore, notificationsStore } from "../lib/stores";

export default function CreateNewPost() {
  const { auth } = authStore();
  const sendNotification = notificationsStore((state) => state.addNotification);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreatingNewPost = (e: FormEvent) => {
    e.preventDefault();
    const button = document.querySelector(
      "#submit-button button[type=submit]"
    ) as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.innerText = "Creating ...";
    }

    fetch("http://localhost:3001/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth!,
      },
      body: JSON.stringify({ title, content }),
    })
      .then((res) => res.json())
      .then((data) => {
        (
          document.querySelector("dialog#main-dialog") as HTMLDialogElement
        )?.close?.();
        if (data.id) {
          sendNotification({
            type: "SUCCESS",
            title: "Created Successfully",
            message: "your post have been successfully created.",
          });
        } else {
          console.error(data);
          sendNotification({
            type: "ERROR",
            title: "Creation Fails",
            message:
              "Something Went Wrong When Creating Your Post, see console for more information.",
          });
        }
      })
      .catch((err) => {
        console.error(err);
        sendNotification({
          type: "ERROR",
          title: "Creation Fails",
          message:
            "Something Went Wrong When Creating Your Post, See console for more details.",
        });
      });
  };

  return (
    <div id="create-new-post-form">
      <h3>Create New Post</h3>
      <form onSubmit={handleCreatingNewPost} className="create-post-form">
        <div>
          <label>
            <sub>Title</sub>
          </label>
          <br />
          <input
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            placeholder="your new post title"
            required
          />
        </div>
        <div>
          <label>
            <sub>Content</sub>
          </label>
          <br />
          <textarea
            onChange={(e) => setContent(e.target.value)}
            placeholder="this is a test so you can use html freely, and you can't delete or update the post anytime."
            required
          ></textarea>
        </div>
        <div id="submit-button">
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
}
