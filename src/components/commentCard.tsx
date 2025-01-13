import { authStore, notificationsStore } from "../lib/stores";
import { UserNameShorthand } from "../lib/utils";
import Avatar from "./avatar";

export default function CommentCard({
  comment,
  comments,
  editComment,
  index,
  postId,
  setComments,
  setEditComment,
}: {
  comment: any;
  comments: any[];
  editComment: any;
  setEditComment: any;
  setComments: any;
  index: number;
  postId: any;
}) {
  const auth = authStore((state) => state.auth);
  const sendNotification = notificationsStore((state) => state.addNotification);

  const handleToogleCommentTools = (comment: any) => {
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

  return (
    <div className="comment">
      <div className="comment-head">
        <Avatar
          url={comment?.commenter?.avatar}
          fallback={UserNameShorthand(comment?.commenter?.username)}
        />
        <sup>{comment?.commenter?.username}</sup>
        <div className="more-expand">
          <div className="expand-info">
            <div
              className="comment-info"
              onClick={() => handleToogleCommentTools(comment)}
            >
              i
            </div>
            <div className="info-dialog" id={`comment-${comment.id}`}>
              <div className="ctool-heart">{comment.likesCount} likes</div>
              {comment.isCommenter && (
                <>
                  <hr />
                  <div
                    className="ctool-edit"
                    onClick={() => {
                      if (editComment === comment.id) {
                        handleEditComment(comment.id, index);
                      } else {
                        setEditComment(comment.id);
                      }
                    }}
                  >
                    {editComment === comment.id ? "Confirm Edits?" : "Edit"}
                  </div>
                  <hr />
                  <div
                    className="ctool-remove"
                    onClick={() => {
                      handleEditComment(comment.id, index, true);
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
        {editComment === comment.id ? (
          <textarea
            className="c-content edit"
            id={`comment-content-${comment.id}`}
            defaultValue={comment?.content}
          ></textarea>
        ) : (
          <div className="c-content" id={`c-content-${comment.id}`}>
            {comment?.content}
          </div>
        )}
      </div>
    </div>
  );
}
