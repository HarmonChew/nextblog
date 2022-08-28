import Image from "next/image";

export default function Page({ user }) {
  return (
    <div className="box-center">
      <Image src={user.photoURL} className="card-img-center" alt="profile" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName}</h1>
    </div>
  );
}
