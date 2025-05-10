/* eslint-disable @typescript-eslint/no-unused-vars */


"use client";


import { Role } from "@/validaton-schema";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ClipLoader } from "react-spinners";

interface Props {
  children: ReactNode;
  allowedRoles: Role[];
}

export function withRole<P>({ children, allowedRoles }: Props) {
  return function RoleHOC(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
      return <ClipLoader />;
    }

    if (!session || !allowedRoles.includes(session.user.role)) {
      router.push("/auth/login");
      return null;
    }

    return <>{children}</>;
  };
}
