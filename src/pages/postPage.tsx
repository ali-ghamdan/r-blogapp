import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authStore, notificationsStore } from "../lib/stores";
import Avatar from "../components/avatar";
import { UserNameShorthand } from "../lib/utils";
import "./postPage.css";
import Loading from "../components/loading";
import Navbar from "../components/navbar";
import Dialoger from "../components/dialoger";

export default function PostPage() {
  const navigate = useNavigate();
  const auth = authStore((state) => state.auth);
  const sendNotification = notificationsStore((state) => state.addNotification);
  const postId = useParams()?.id;
  if (!postId || !auth) navigate(auth ? "/" : "/login");
  const [data, setData] = useState<any>({});
  const [comment, setComment] = useState("");
  const [havePrev, setHavePrev] = useState(false);
  const [haveNext, setHaveNext] = useState(false);
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState<Array<any> | null | undefined>(
    undefined
  );

  const handleCreateComment = (e: FormEvent) => {
    e.preventDefault();
    fetch(`http://localhost:3001/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth!,
      },
      body: JSON.stringify({ content: comment }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setComment("");
          sendNotification({
            type: "SUCCESS",
            title: "Comment Created",
            message: "You Have Created You Comment Successfully.",
          });
          setComments((state) => {
            return [data, ...(state as Array<any>)];
          });
        } else {
          console.error(data);
          sendNotification({
            type: "ERROR",
            title: "Can't Create Comment",
            message: "Check console.",
          });
        }
      });
  };

  useEffect(() => {
    fetch(`http://localhost:3001/posts/${postId}`, {
      method: "GET",
      headers: {
        Authorization: auth!,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!("id" in data)) {
          console.log(data);
          sendNotification({
            type: "ERROR",
            title: "404 Post",
            message: "Post wasn't found so, you are in the home again.",
          });
          navigate("/");
        } else {
          setData(data);
        }
      });
  }, [postId, auth]);

  useEffect(() => {
    fetch(`http://localhost:3001/posts/${postId}/comments?page=${page}`, {
      headers: {
        Authorization: auth!,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!("prev" in data) || !("next" in data) || !("data" in data)) {
          console.error(data);
          sendNotification({
            type: "ERROR",
            title: "Can't Get Notifications",
            message:
              "Something went wrong?, see the console for more detailed answer",
          });
          setComments(null);
        } else {
          setHavePrev(data.prev);
          setHaveNext(data.next);
          setComments(data.data);
        }
      });
  }, [page, JSON.stringify(comments)]);
  return (
    <>
      <Navbar />
      <Dialoger />
      <div id="post-content">
        <div>
          <div className="post-header">
            <h2>{data.title?.split("-").slice(1).join("-")}</h2>
            <div className="user-info">
              <Avatar
                url={data.poster?.avatar}
                fallback={UserNameShorthand(data.poster?.username)}
              />

              <div>
                <div>{data.poster?.username}</div>
                <sup>
                  <span className="user-data">{data.poster?.postsCount}</span>{" "}
                  posts |{" "}
                  <span className="user-data">
                    {new Date(data.poster?.createdAt).toLocaleDateString()}
                  </span>{" "}
                  Ago
                </sup>
              </div>
            </div>
          </div>
          <hr />
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: data.content }}
          ></div>
          <hr />
          <div className="post-footer">
            <sub>Comments:</sub>
            <div className="create-comment-form">
              <form onSubmit={handleCreateComment}>
                <input
                  onChange={(e) => setComment(e.target.value)}
                  className="create-comment-input"
                  placeholder="only text, no html is allowed here."
                />
                <button type="submit" disabled={comment === ""}>
                  Send
                </button>
              </form>
              <hr />
              <div className="comments">
                {comments === undefined ? (
                  <Loading />
                ) : comments === null ? (
                  <div>No Comments found, be the first Commenter.</div>
                ) : (
                  <div>
                    {comments.map((c) => {
                      return (
                        <div className="comment">
                          <div className="comment-head">
                            <Avatar
                              url={c?.commenter?.avatar}
                              fallback={UserNameShorthand(
                                c?.commenter?.username
                              )}
                            />
                            <sup>{c?.commenter.username}</sup>
                          </div>
                          <div>
                            <div className="c-content">{c?.content}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <hr />
                <div className="pagination-container">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((state) => state - 1);
                    }}
                    className="prev"
                    disabled={!havePrev || page < 2}
                  >
                    {"<"}
                  </button>
                  <div className="page-number">{page}</div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((state) => state + 1);
                    }}
                    className="next"
                    disabled={!haveNext}
                  >
                    {">"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
