import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";

// Sign Up
export const doCreateUserWithEmailAndPassword = async (email, password, displayName = "User") => {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  //  Update profile with name & default avatar
  await updateProfile(result.user, {
    displayName: displayName,
    photoURL: "https://randomuser.me/api/portraits/lego/1.jpg",
  });

  //  Send verification email
  await sendEmailVerification(result.user, {
    url: `${window.location.origin}/Dashboard`,
  });

  return result;
};

// Sign In
export const doSignInWithEmailAndPassword = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google Sign In
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

// GitHub Sign In
export const doSignInWithGithub = async () => {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result;
};

// Sign Out
export const doSignOut = () => {
  return auth.signOut();
};

// Password Reset
export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/`, // ✅ redirect after reset
  });
};

// Change Password
export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

// Email Verification
export const doSendEmailVerification = () => {
  if (auth.currentUser) {
    return sendEmailVerification(auth.currentUser, {
      url: `${window.location.origin}/Dashboard`,
    });
  } else {
    throw new Error("No user logged in");
  }
};
