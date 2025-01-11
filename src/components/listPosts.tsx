import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialoger from "../components/dialoger";
import Loading from "../components/loading";
import Navbar from "../components/navbar";
import { authStore, notificationsStore } from "../lib/stores";
import "./listPosts.css";
import PostCard from "./postCard";
import { PostCardData } from "../lib/types";

export default function ListPosts({
  type,
}: {
  type: "HOME" | "MY_POSTS" | "MY_FEEDS" | "SEARCH";
}) {
  const navigate = useNavigate();
  const auth = authStore((state) => state.auth);
  const sendNotification = notificationsStore((state) => state.addNotification);
  if (!auth) {
    navigate("/login");
  }

  const query = new URL(location.href).searchParams.get("q");
  const [posts, setPosts] = useState<Array<any> | undefined | null>(undefined);
  const [havePrev, setHavePrev] = useState(false);
  const [page, setPage] = useState(1);
  const [haveNext, setHaveNext] = useState(false);

  useEffect(() => {
    fetch(
      `http://localhost:3001/posts${
        type === "HOME"
          ? "/recents"
          : type === "MY_FEEDS"
          ? "/feeds"
          : type === "SEARCH"
          ? "/search"
          : ""
      }?page=${page}${
        type === "SEARCH" ? `&q=${encodeURIComponent(query!)}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth!,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (!("prev" in data) || !("next" in data) || !("data" in data)) {
          sendNotification({
            type: "ERROR",
            title: "Can't Fetch Recent Posts",
            message:
              "Something Went Wrong So No Recent Post will be Display, Maybe The Server is turned Off?",
          });
        } else {
          console.log({ data });
          setHavePrev(data.prev);
          setHaveNext(data.next);
          setPosts(data.data);
        }
      });
  }, [page]);

  return (
    <div>
      {(type === "HOME" || type === "SEARCH") && (
        <>
          <Navbar />
          <Dialoger />
        </>
      )}
      <div className="content">
        <h3>
          {type === "HOME"
            ? "Most Recent Posts"
            : type === "MY_FEEDS"
            ? "Your Feeds"
            : type === "SEARCH"
            ? "Search Results"
            : "Your Posts"}
        </h3>
        {posts === undefined ? (
          <Loading />
        ) : posts === null || posts?.length === 0 ? (
          <h4>Actually there is 0 post in this page.</h4>
        ) : (
          <>
            <div className="posts-show">
              {posts.map((post: PostCardData) => {
                return <PostCard {...post} />;
              })}
            </div>
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
          </>
        )}
      </div>
    </div>
  );
}
