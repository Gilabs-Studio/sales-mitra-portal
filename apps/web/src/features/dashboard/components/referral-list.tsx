import type { Referral } from "../types/dashboard.types";

export function ReferralList({ referrals }: { referrals: Referral[] }) {
  return (
    <section className="rounded-lg bg-secondary/45 p-4.5">
      <h2 className="text-sm font-extrabold text-foreground">Referral code</h2>
      <div className="mt-3.5 grid gap-3">
        {referrals.map((referral) => (
          <div key={referral.id} className="rounded-lg bg-card p-3.5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{referral.product}</p>
            <p className="mt-1.5 font-mono text-base font-extrabold text-foreground">{referral.code}</p>
            <p className="mt-1 text-[10px] font-medium text-muted-foreground">Dipakai {referral.usageCount} kali</p>
          </div>
        ))}
      </div>
    </section>
  );
}
