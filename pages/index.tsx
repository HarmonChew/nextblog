import styles from "../styles/Home.module.scss";
import Loader from "../components/Loader";
import {
  collectionGroup,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { fromMillis, postToJSON } from "../lib/firebase";
import { useState } from "react";
import PostFeed from "../components/Postfeed";

const LIMIT = 1;

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  console.log(props.posts);

  const getMorePosts = async () => {
    setLoading(true);

    if (posts.length >= 1) {
      const last = posts[posts.length - 1];

      const cursor =
        typeof last.createdAt === "number"
          ? fromMillis(last.createdAt)
          : last.createdAt;

      const ref = collectionGroup(getFirestore(), "posts");

      const postsQuery = query(
        ref,
        where("published", "==", true),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(LIMIT)
      );

      const newPosts = (await getDocs(postsQuery)).docs.map((doc) =>
        doc.data()
      );

      setPosts(posts.concat(newPosts));

      setLoading(false);
      if (newPosts.length <= LIMIT) {
        setPostsEnd(true);
      }
    }
  };

  return (
    <main>
      <PostFeed posts={posts} admin={false} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more posts</button>
      )}

      <Loader show={loading} />

      {postsEnd && <p>No more posts!</p>}
    </main>
  );
}

export async function getServerSideProps(context) {
  const ref = collectionGroup(getFirestore(), "posts");
  const postsQuery = query(
    ref,
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(LIMIT)
  );

  const posts = (await getDocs(postsQuery)).docs.map(postToJSON);

  return {
    props: { posts },
  };
}
