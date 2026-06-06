import type { Referral } from "../types/dashboard.types";

export function ReferralList({ referrals }: { referrals: Referral[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-extrabold text-foreground">Referral code</h2>
      <div className="mt-4 grid gap-3">
        {referrals.map((referral) => (
          <div key={referral.id} className="rounded-lg border border-border bg-secondary p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{referral.product}</p>
            <p className="mt-2 font-mono text-lg font-semibold text-foreground">{referral.code}</p>
            <p className="mt-1 text-xs text-muted-foreground">Dipakai {referral.usageCount} kali</p>
          </div>
        ))}
      </div>
    </section>
  );
}
