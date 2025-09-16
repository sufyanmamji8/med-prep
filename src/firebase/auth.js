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

/**
 * Create new user with email/password
 * Sets displayName & default photoURL
 * Sends email verification
 */
export const doCreateUserWithEmailAndPassword = async (
  email,
  password,
  displayName = "User"
) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Update profile with name & default avatar
  await updateProfile(result.user, {
    displayName,
    photoURL: "https://randomuser.me/api/portraits/lego/1.jpg",
  });

  // Send verification email
  await sendEmailVerification(result.user, {
    url: `${window.location.origin}/dashboard`, // ✅ lowercase for consistency
  });

  // Reload user to ensure updated profile info
  await result.user.reload();

  return result.user;
};

/**
 * Sign In with email & password
 */
export const doSignInWithEmailAndPassword = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await result.user.reload();
  return result.user;
};

/**
 * Google Sign In
 */
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await result.user.reload();
  return result.user;
};

/**
 * GitHub Sign In
 */
export const doSignInWithGithub = async () => {
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await result.user.reload();
  return result.user;
};

/**
 * Sign Out
 */
export const doSignOut = async () => {
  return auth.signOut();
};

/**
 * Send Password Reset Email
 */
export const doPasswordReset = async (email) => {
  return sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/`, // redirect after reset
  });
};

/**
 * Change Password
 */
export const doPasswordChange = async (password) => {
  if (!auth.currentUser) throw new Error("No user logged in");
  return updatePassword(auth.currentUser, password);
};

/**
 * Send Email Verification
 */
export const doSendEmailVerification = async () => {
  if (!auth.currentUser) throw new Error("No user logged in");
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/dashboard`,
  });
};
