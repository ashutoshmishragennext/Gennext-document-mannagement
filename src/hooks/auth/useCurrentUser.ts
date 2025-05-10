import { useSession } from "next-auth/react";

// Custom hook to get the currently logged-in user in a client component.
export function useCurrentUser() {
  const session = useSession();

  return session.data?.user;
}
