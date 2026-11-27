import { CircleDollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Branded card used by the signed-out screens (sign in, password reset). */
export function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="login-page">
      <Card className="login-card block border-0">
        <div className="brand" style={{ padding: 0, height: "auto", border: 0 }}>
          <div className="brand-mark" aria-hidden="true">
            <CircleDollarSign />
          </div>
          <div>
            <b>Prospeva</b>
          </div>
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </Card>
    </main>
  );
}
