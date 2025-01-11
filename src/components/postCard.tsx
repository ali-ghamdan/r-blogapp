import moment from "moment";
import { PostCardData } from "../lib/types";
import { UserNameShorthand } from "../lib/utils";
import Avatar from "./avatar";
import "./postCard.css";
import { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function PostCard(post: PostCardData) {
  const navigate = useNavigate();

  const handleOpenPost = (e: MouseEvent) => {
    e.preventDefault();
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post-card" onClick={handleOpenPost}>
      <div className="post-title">
        {post.title?.split("-").slice(1).join("-")}
      </div>
      <div className="post-info">
        <div className="post-author">
          <Avatar
            url={post.poster.avatar || ""}
            fallback={UserNameShorthand(post.poster.username)}
          />{" "}
          <div className="post-username">{post.poster.username}</div>
        </div>
        <div>
          <sub className="post-details">
            {post.commentsCount} 📝 <hr /> {post.likes}{" "}
            {post.isLikedByAuthorizedUser ? "❤️" : "♡"} <hr />
            {moment(post.createdAt).fromNow()}
          </sub>
        </div>
      </div>
    </div>
  );
}
