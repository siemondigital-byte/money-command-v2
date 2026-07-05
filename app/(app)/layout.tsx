import { requireUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GoalAutoSync } from "@/components/GoalAutoSync";
import { serializeProfile } from "@/lib/serialize";
import { getDict } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();
  // Dict resuelto por locale del perfil. Se pasa al provider para que los
  // Client Components lo consuman con useTranslations().
  const dict = getDict(profile.locale);

  return (
    <I18nProvider dict={dict}>
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
    </I18nProvider>
  );
}
