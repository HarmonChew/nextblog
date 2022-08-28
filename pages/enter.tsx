import { signInAnonymously, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import { useCallback, useContext, useEffect, useState } from "react";
import { UserContext } from "../lib/context";
import { auth, googleAuthProvider } from "../lib/firebase";
import { doc, getDoc, getFirestore, writeBatch } from "firebase/firestore";
import debounce from "lodash.debounce";

export default function EnterPage({}) {
  const { user, username } = useContext(UserContext);

  return (
    <main>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  );
}

function UsernameForm() {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = doc(getFirestore(), "usernames", username);
        const snapshot = await getDoc(ref);
        console.log("FireStore read executed!", snapshot.exists());
        setIsValid(!snapshot.exists());
        setLoading(false);
      }
    }, 500),
    []
  );

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const userDoc = doc(getFirestore(), "users", user.uid);
      const usernameDoc = doc(getFirestore(), "usernames", formValue);

      const batch = writeBatch(getFirestore());
      batch.set(userDoc, {
        username: formValue,
        photoURL: user.photoURL,
        displayName: user.displayName,
      });
      batch.set(usernameDoc, { uid: user.uid });

      await batch.commit();
    } catch (e) {
      console.log(e);
    }
  };

  const onChange = (e) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  return (
    !username && (
      <section>
        <h3>Choose Username</h3>
        <Message username={formValue} isValid={isValid} loading={loading} />

        <form onSubmit={onSubmit}>
          <input
            name="username"
            placeholder="Username"
            value={formValue}
            onChange={onChange}
            autoComplete="false"
          />

          <button type="submit" className="btn-green" disabled={!isValid}>
            Choose
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    )
  );
}

function SignOutButton() {
  return <button onClick={() => auth.signOut()}> Sign out</button>;
}

function SignInButton() {
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleAuthProvider);
  };

  return (
    <>
      <button className="btn-google" onClick={signInWithGoogle}>
        <Image src="/assets/google.webp" alt="Google" width={75} height={75} />{" "}
        Sign In With Google
      </button>
      <button onClick={() => signInAnonymously(auth)}>
        Sign in Anonymously
      </button>
    </>
  );
}

function Message({ username, isValid, loading }) {
  if (username.length < 3 && username.length > 0) {
    return <p className="text-danger">Username is too short!</p>;
  } else if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">{username} is taken!</p>;
  } else {
    return <p>&nbsp;</p>;
  }
}
