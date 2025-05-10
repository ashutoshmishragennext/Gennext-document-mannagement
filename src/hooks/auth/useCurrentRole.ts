import { useSession } from "next-auth/react";

// Custom hook to get the role of currently logged-in user in a client component.
export function useCurrentRole() {
  const session = useSession();

  return session.data?.user.role;
}
