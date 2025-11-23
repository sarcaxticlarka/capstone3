"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function GoogleAuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="mb-4 flex flex-col items-center">
        <p className="text-white mb-2">Signed in as {session.user?.email}</p>
        <button
          onClick={() => signOut()}
          className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded mb-2"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full bg-white text-black font-semibold py-2 px-4 rounded shadow hover:bg-gray-200 mb-2 flex items-center justify-center gap-2"
    >
      <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2" xmlns="http://www.w3.org/2000/svg"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.69 30.13 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.19C12.13 13.41 17.56 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.91-2.18 5.38-4.65 7.04l7.19 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.28a14.5 14.5 0 0 1 0-8.56l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.47l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.13 0 11.64-2.02 15.84-5.5l-7.19-5.59c-2.01 1.35-4.59 2.15-8.65 2.15-6.44 0-11.87-3.91-13.33-9.28l-7.98 6.19C6.73 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
      Sign in with Google
    </button>
  );
}
