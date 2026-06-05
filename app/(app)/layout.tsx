import { requireUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { serializeProfile } from "@/lib/serialize";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header profile={serializeProfile(profile)} />
      <main
        className="mx-auto"
        style={{ maxWidth: "1100px", padding: "24px 20px 64px" }}
      >
        {children}
      </main>
    </div>
  );
}
