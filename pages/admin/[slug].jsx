import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import AuthCheck from "../../components/AuthCheck";
import { auth } from "../../lib/firebase";

import styles from "../../styles/Admin.module.scss";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import ImageUploader from "../../components/ImageUploader";

export default function AdminPostEdit({}) {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

const PostManager = () => {
  const [preview, setPreview] = useState(false);
  const [post, setPost] = useState(null);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(
    getFirestore(),
    "users",
    auth.currentUser.uid,
    "posts",
    slug
  );

  // const getPost = async () => {
  //   const post = await getDoc(postRef);
  //   return post.data();
  // };

  // const post = getPost();

  useEffect(() => {
    getDoc(postRef).then((doc) => {
      setPost(doc.data());
    });
  }, []);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm postRef={postRef} post={post} preview={preview} />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </>
      )}
    </main>
  );
};

const PostForm = ({ postRef, post, preview }) => {
  const preloadedValues = {
    ...post,
  };

  console.log(preloadedValues);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
  } = useForm({
    defaultValues: preloadedValues,
    mode: "onChange",
  });

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />

        <textarea
          name="title"
          {...register("content", {
            maxLength: { value: 20000, message: "content is too long" },
            minLength: { value: 10, message: "content is too short" },
            required: "Content is required",
          })}
        ></textarea>

        {errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            name="published"
            type="checkbox"
            {...register("published")}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

function DeletePostButton({ postRef }) {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm("Are you sure!");
    if (doIt) {
      await deleteDoc(postRef);
      router.push("/admin");
      toast("Post Annihilated ", { icon: "🗑️" });
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
}
