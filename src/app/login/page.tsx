"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink() {
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div style={{ maxWidth: 420, margin: "10vh auto" }}>
      <div className="hero-header">
        <div className="heading-impact" style={{ fontSize: "2rem" }}>AST</div>
        <p className="hero-quote">Athletic Systems Training</p>
      </div>

      <Card>
        <h2>Entrar</h2>
        {status === "sent" ? (
          <p className="muted" style={{ marginTop: 8 }}>
            Te mandamos un link de acceso a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo.
          </p>
        ) : (
          <>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email) sendMagicLink();
                }}
              />
            </Field>
            {error && <p className="card">⚠️ {error}</p>}
            <Button
              variant="primary"
              onClick={sendMagicLink}
              disabled={!email || status === "sending"}
              style={{ marginTop: 8 }}
            >
              {status === "sending" ? "Enviando…" : "Mandar magic link"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
