import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container-page py-24 flex items-center justify-center text-brand-500">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}
