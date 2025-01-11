import { FormEvent, MouseEvent, useEffect, useState } from "react";
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
  const [editComment, setEditComment] = useState("");

  const handleToogleCommentTools = (e: MouseEvent, comment: any) => {
    const tool = document.querySelector<HTMLDivElement>(
      `#comment-${comment.id}`
    );
    if (tool) {
      tool.classList.toggle("opened");
    }
  };

  const handleEditComment = (
    commentId: string,
    index: number,
    del?: boolean
  ) => {
    const comment = comments?.[index];
    var body: any;
    const modifiedContent = document.querySelector<HTMLTextAreaElement>(
      `#comment-content-${commentId}`
    );
    if (!del) {
      if (!comment || !modifiedContent)
        return sendNotification({
          title: "Comment Not Found",
          type: "ERROR",
          message: "couldn't find the comment.",
        });
      if (modifiedContent.value === comment.content) {
        setEditComment("");
        sendNotification({
          type: "WARN",
          title: "Won't Update Comment",
          message: "writing the same content will not work",
        });
        return;
      }
      body = {
        content: modifiedContent.value,
      };
    }
    fetch(`http://localhost:3001/posts/${postId}/comments/${commentId}`, {
      method: del ? "DELETE" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth!,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEditComment("");
          const c = [...comments!];
          if (del) {
            c.splice(index, 1);
          } else {
            c[index].content = modifiedContent?.value;
          }
          setComments(c);
          sendNotification({
            type: "SUCCESS",
            title: "Modified Successfully",
            message: "you got changes the changes.",
          });
        } else {
          console.error(data);
          sendNotification({
            type: "ERROR",
            title: "failed to edit/delete comment",
            message: "see console for more details",
            ...data,
          });
        }
      });
  };

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
            dangerouslySetInnerHTML={{
              __html: `<h2>${data.title?.split("-").slice(1).join("-")}</h2>\n${
                data.content
              }`,
            }}
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
                    {comments.map((c, index) => {
                      return (
                        <div className="comment">
                          <div className="comment-head">
                            <Avatar
                              url={c?.commenter?.avatar}
                              fallback={UserNameShorthand(
                                c?.commenter?.username
                              )}
                            />
                            <sup>{c?.commenter?.username}</sup>
                            <div className="more-expand">
                              <div className="expand-info">
                                <div
                                  className="comment-info"
                                  onClick={(e) =>
                                    handleToogleCommentTools(e, c)
                                  }
                                >
                                  i
                                </div>
                                <div
                                  className="info-dialog"
                                  id={`comment-${c.id}`}
                                >
                                  <div className="ctool-heart">
                                    {c.likesCount} likes
                                  </div>
                                  {c.isCommenter && (
                                    <>
                                      <hr />
                                      <div
                                        className="ctool-edit"
                                        onClick={() => {
                                          if (editComment === c.id) {
                                            handleEditComment(c.id, index);
                                          } else {
                                            setEditComment(c.id);
                                          }
                                        }}
                                      >
                                        {editComment === c.id
                                          ? "Confirm Edits?"
                                          : "Edit"}
                                      </div>
                                      <hr />
                                      <div
                                        className="ctool-remove"
                                        onClick={() => {
                                          handleEditComment(c.id, index, true);
                                        }}
                                      >
                                        Remove
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            {editComment === c.id ? (
                              <textarea
                                className="c-content edit"
                                id={`comment-content-${c.id}`}
                                defaultValue={c?.content}
                              ></textarea>
                            ) : (
                              <div
                                className="c-content"
                                id={`c-content-${c.id}`}
                              >
                                {c?.content}
                              </div>
                            )}
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
