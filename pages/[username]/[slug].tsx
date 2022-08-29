import {
  doc,
  getFirestore,
  getDoc,
  collectionGroup,
  query,
  getDocs,
  limit,
} from "firebase/firestore";
import { getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import PostContent from "../../components/PostContent";
import { useContext } from "react";
import { UserContext } from "../../lib/context";
import Link from "next/link";
import AuthCheck from "../../components/AuthCheck";
import HeartButton from "../../components/HeartButton";
import styles from "../../styles/Post.module.scss";

export default function PostPage({ post, path }) {
  const postRef = doc(getFirestore(), path);
  const [realTimePost] = useDocumentData(postRef);

  const postToDisplay = realTimePost || post;

  const { user: currentUser } = useContext(UserContext);

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={postToDisplay} />
      </section>

      <aside className="card">
        <p>
          <strong>{postToDisplay.heartCount || 0} 🤍</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>

        {currentUser?.uid === post.uid && (
          <Link href={`/admin/${post.slug}`}>
            <button className="btn-blue">Edit Post</button>
          </Link>
        )}
      </aside>
    </main>
  );
}

export async function getStaticProps({ params }) {
  const { username, slug } = params;

  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = doc(getFirestore(), userDoc.ref.path, "posts", slug);

    post = postToJSON(await getDoc(postRef));

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 1000,
  };
}

export async function getStaticPaths({ params }) {
  const postsRef = collectionGroup(getFirestore(), "posts");
  const q = query(postsRef, limit(20));
  const posts = await getDocs(q);

  const paths = posts.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: {
        username,
        slug,
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
}
