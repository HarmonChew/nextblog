import Image from "next/image";

export default function Page({ user }) {
  return (
    <div className="box-center">
      <div>
        <Image
          src={user.photoURL}
          className="card-img-center"
          alt="profile"
          width={125}
          height={125}
          layout="fixed"
        />
      </div>
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName}</h1>
    </div>
  );
}
