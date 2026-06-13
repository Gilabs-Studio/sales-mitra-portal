import { redirect } from "next/navigation";

export default function RootNotFound() {
  redirect("/id/404" as any);
}
