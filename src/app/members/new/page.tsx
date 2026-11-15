import { AppShell } from "@/components/app-shell";
import { PageHead } from "@/components/ui";
import { MemberForm } from "./member-form";

export default function NewMemberPage() {
  return (
    <AppShell>
      <PageHead
        title="Cấp thẻ mới"
        meta="Mã thẻ được đánh số tự động, không cần nhập"
      />
      <MemberForm />
    </AppShell>
  );
}
