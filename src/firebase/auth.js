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
} from "firebase/auth";

// Sign Up
export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
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

// Password Reset (takes email, not password!)
export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Change Password
export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

// Email Verification
export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/Dashboard`,
  });
};
    