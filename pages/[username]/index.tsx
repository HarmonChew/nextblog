import PostFeed from "../../components/Postfeed";
import UserProfile from "../../components/UserProfile";

export default function UserPage({}) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
}
