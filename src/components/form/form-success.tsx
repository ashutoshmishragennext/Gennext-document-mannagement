import { CheckCircle } from "lucide-react";

interface Props {
  message?: string;
}

export function FormSuccess({ message }: Props) {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CheckCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}
