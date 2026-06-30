import { requireUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoalAutoSync } from "@/components/GoalAutoSync";
import { serializeProfile } from "@/lib/serialize";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Sync-on-entry: dispara el sync de gastos de metas una vez al montar
          (Server Action, fire-and-forget). No bloquea ni renderiza nada. */}
      <GoalAutoSync />
      <Header profile={serializeProfile(profile)} />
      <main
        className="mx-auto"
        style={{ maxWidth: "1100px", padding: "24px 20px 64px", width: "100%", flex: 1 }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
