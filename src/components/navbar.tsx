import { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from "react";
import "./navbar.css";
import dialogCloser from "../lib/dialogCloser";
import Avatar from "./avatar";
import { UserNameShorthand } from "../lib/utils";
import { authStore, dialogStore, notificationsStore } from "../lib/stores";
import { dialogPage } from "../lib/types";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";

export default function Navbar() {
  const navigate = useNavigate();
  const { auth, setAuth } = authStore();
  const sendNotification = notificationsStore((state) => state.addNotification);
  const setDialog = dialogStore((state) => state.setDialog);
  const handleProfileDialog = (e: MouseEvent) => {
    e.preventDefault();
    const profileDialog = document.querySelector(
      ".profile-dialog"
    )! as HTMLDialogElement;
    profileDialog.showModal();
  };
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const handleSearching = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = (
      e.currentTarget.querySelector('input[name="q"]') as HTMLInputElement
    )?.value;
    if (q) location.href = `/search?q=${q}`;
  };

  const updateProfileData = ({
    avt,
    usrname,
    password,
    type,
  }: {
    avt?: string;
    usrname?: string;
    password?: string;
    type: "USERNAME" | "AVATAR" | "PASSWORD";
  }) => {
    return fetch("http://localhost:3001/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth!,
      },
      body: JSON.stringify({
        avatar: avt,
        username: usrname,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log({ updateProfile: data });
        if (!data.access_token && !data.success) {
          return sendNotification({
            type: "ERROR",
            title: data.error,
            message: data.message,
          });
        }
        if (type === "USERNAME") setUsername(usrname || username);
        else if (type === "AVATAR") setAvatar(avt || avatar);
        if (data.access_token) {
          setAuth(data.access_token);
        }
        return true;
      })
      .catch((err) => {
        console.error(err);
        sendNotification({
          type: "ERROR",
          title: "updating profile fails.",
          message: String(err),
        });
      });
  };

  const handleChangingData = async (
    e: MouseEvent,
    type: "USERNAME" | "AVATAR" | "PASSWORD"
  ) => {
    e.preventDefault();
    const res = prompt(`What is Your New ${type.toLowerCase()}?`);
    (document.querySelector(".profile-dialog") as HTMLDialogElement)?.close?.();

    if (!res)
      return sendNotification({
        type: "INFO",
        title: "Empty Fields",
        message: `Please When Changing new ${type.toLowerCase()}, don't exist the prompt`,
      });
    if (type === "PASSWORD") {
      const res2 = prompt("Rewrite your new Password (confirming).");
      if (res !== res2) {
        return sendNotification({
          type: "ERROR",
          title: "Not Same Password",
          message:
            "Password didn't match Confirm Password, when writing the same password, you will need to login Again.",
        });
      }
      // TODO: Change In The Server.
    } else if (type === "AVATAR") {
      try {
        new URL(res);
        if (!res.match(/\.(jpeg|jpg|gif|png|ico)$/)) {
          throw new Error("Not a valid image URL");
        }
      } catch (error) {
        return sendNotification({
          type: "ERROR",
          title: "Invalid URL",
          message:
            "The URL provided is not a valid image URL. Please provide a correct image URL.",
        });
      }
    } else if (type === "USERNAME") {
    }
    const isUpdated = await updateProfileData({
      type,
      ...(type === "AVATAR"
        ? { avt: res }
        : type === "USERNAME"
        ? { usrname: res }
        : { password: res }),
    });
    isUpdated &&
      sendNotification({
        type: "SUCCESS",
        title: `Changed Applied`,
        message: `Your ${type.toLowerCase()} changed successfully.`,
      });
  };

  const handleLogout = (e: MouseEvent) => {
    e.preventDefault();
    setAuth(null);
  };

  const handleChangingDialog = (e: MouseEvent, dialog: dialogPage) => {
    e.preventDefault();
    setDialog(dialog);
  };

  if (!auth) navigate("/login");

  useEffect(() => {
    fetch("http://localhost:3001/auth/profile", {
      method: "GET",
      headers: {
        Authorization: auth!,
        contentType: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const {
          username,
          email,
          avatar,
          followersCount,
          followingCount,
          postsCount,
        } = data;
        if (!username || !email) {
          navigate("/login");
        } else {
          setUsername(username);
          setEmail(email);
          setAvatar(avatar);
          setFollowersCount(followersCount);
          setFollowingCount(followingCount);
          setPostsCount(postsCount);
        }
      })
      .catch((err) => {
        console.error(err);
        sendNotification({
          type: "ERROR",
          title: "Profile Error",
          message: String(err),
        });
      });
  }, [auth]);

  return (
    <>
      <nav>
        <div className="search-bar">
          <form onSubmit={handleSearching}>
            <input
              name="q"
              type="text"
              placeholder="🔎 Search for Posts"
              required
            />
            <button type="submit" id="s-s-button">
              🔎
            </button>
          </form>
        </div>
        <div>
          <div className="profile">
            <button onClick={handleProfileDialog}>Profile</button>
            <dialog onClick={dialogCloser} className="profile-dialog">
              {email === "" ? (
                <Loading />
              ) : (
                <>
                  <div className="profile-header">
                    <Avatar
                      url={avatar}
                      fallback={UserNameShorthand(username)}
                    />
                    <div>
                      <div
                        style={{
                          textAlign: "center",
                          wordBreak: "break-word",
                          marginLeft: 0,
                        }}
                      >
                        <div>{username}</div>
                        <sub style={{ marginLeft: 10 }}>{email}</sub>
                      </div>

                      <div className="profile-stats">
                        <div>{postsCount} Posts</div>
                        <div>{followersCount} Followers</div>
                        <div>{followingCount} Followings</div>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <ul>
                      <li
                        onClick={(e) =>
                          handleChangingDialog(e, dialogPage.CREATE_NEW_POST)
                        }
                      >
                        Create New Post
                      </li>
                      <li
                        onClick={(e) =>
                          handleChangingDialog(e, dialogPage.SHOW_MY_POSTS)
                        }
                      >
                        Show My Posts
                      </li>
                      <li
                        onClick={(e) =>
                          handleChangingDialog(e, dialogPage.SHOW_FEEDS)
                        }
                      >
                        Show Feeds
                      </li>
                      <li onClick={(e) => handleChangingData(e, "USERNAME")}>
                        Edit Username
                      </li>
                      <li onClick={(e) => handleChangingData(e, "AVATAR")}>
                        Edit Avatar
                      </li>
                      <li onClick={(e) => handleChangingData(e, "PASSWORD")}>
                        Edit Password
                      </li>
                      <li onClick={handleLogout}>Logout</li>
                    </ul>
                  </div>
                </>
              )}
            </dialog>
          </div>
        </div>
      </nav>
    </>
  );
}
