import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";

export default async function RootPage() {
  const session = await getOptionalUser();
  redirect(session ? "/dashboard" : "/login");
}
