import { CardWrapper } from "@/components/auth/card-wrapper";
import { TriangleAlert } from "lucide-react";

export function ErrorCard() {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong!"
      backButtonLabel="Back to login"
      backButtonHref="/login"
    >
      <div className="flex w-full items-center justify-center">
        <TriangleAlert className="text-destructive" />
      </div>
    </CardWrapper>
  );
}
