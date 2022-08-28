import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";
import { UserContext } from "../lib/context";
import { auth } from "../lib/firebase";

import { signOut } from "firebase/auth";

export default function Navbar({}) {
  const { user, username } = useContext(UserContext);

  const router = useRouter();

  const signOutNow = () => {
    signOut(auth);
    router.reload();
  };
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link href="/">
            <button className="btn-logo">HOME</button>
          </Link>
        </li>

        {username && (
          <>
            <li className="push-left">
              <button onClick={signOutNow}>Sign Out</button>
            </li>
            <li>
              <Link href="/admin">
                <button className="btn-blue">Write Posts</button>
              </Link>
            </li>
            <li>
              <Link
                href={`/${username}`}
                style={{ borderRadius: "5px", overflow: "hidden" }}
              >
                <div style={{ borderRadius: "50%", overflow: "hidden" }}>
                  <Image
                    src={user?.photoURL}
                    alt="profile"
                    width={50}
                    height={50}
                  />
                </div>
              </Link>
            </li>
          </>
        )}

        {!username && (
          <li>
            <Link href="/enter">
              <button className="btn-blue">Sign In</button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
