"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";

interface AthleteTurn {
  role: "athlete";
  content: string;
}

interface CoachTurn {
  role: "coach";
  content: string;
  ready_to_finalize: boolean;
  proposed_goal_text: string | null;
}

type ConversationTurn = AthleteTurn | CoachTurn;

interface GoalRow {
  id: string;
  status: "draft" | "active" | "closed";
  goal_text: string | null;
  conversation: ConversationTurn[];
}

export default function GoalPage() {
  const router = useRouter();
  const [active, setActive] = useState<GoalRow | null | undefined>(undefined);
  const [draft, setDraft] = useState<GoalRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function load() {
    fetch("/api/coach/goal")
      .then((r) => r.json())
      .then((d) => {
        setActive(d?.active ?? null);
        setDraft(d?.draft ?? null);
      })
      .catch(() => setActive(null));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [draft?.conversation.length]);

  async function send() {
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/coach/goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input.trim() }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar el mensaje.");
      return;
    }
    setDraft(data);
    setInput("");
  }

  async function finalize(text: string) {
    const res = await fetch("/api/coach/goal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal_text: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar la meta.");
      return;
    }
    setActive(data);
    setDraft(null);
    setEditing(false);
    setSavedNotice(true);
  }

  const lastCoachTurn = draft?.conversation.filter((t): t is CoachTurn => t.role === "coach").at(-1);

  const showChat = editing || !!draft || active === null;

  return (
    <div>
      <div className="exercise-card-header" style={{ marginBottom: 12 }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={22} color="var(--accent-primary)" /> Meta
        </h1>
      </div>

      {active === undefined && <p className="muted">Cargando…</p>}

      {active && !editing && (
        <div className="card">
          <p className="muted" style={{ marginBottom: 4 }}>Meta vigente</p>
          <p>{active.goal_text}</p>
          <button style={{ marginTop: 12 }} onClick={() => setEditing(true)}>
            Editar / pulir meta
          </button>
        </div>
      )}

      {savedNotice && !editing && (
        <div className="card">
          <p className="muted" style={{ marginBottom: 8 }}>
            Meta guardada ✓. ¿Quieres que el coach reevalúe el bloque activo con esta meta?
          </p>
          <button onClick={() => router.push("/block?propose=1")}>Generar propuesta de bloque</button>
        </div>
      )}

      {active === null && !draft && !editing && (
        <p className="muted" style={{ marginBottom: 12 }}>
          Todavía no hay una meta vigente. Escribe abajo qué quieres priorizar en este ciclo — el coach
          te va a ayudar a afinarla antes de guardarla.
        </p>
      )}

      {showChat && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(draft?.conversation ?? []).map((turn, i) => (
            <div
              key={i}
              style={{
                alignSelf: turn.role === "athlete" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: turn.role === "athlete" ? "var(--accent-primary)" : "var(--surface-2)",
                color: turn.role === "athlete" ? "white" : "var(--foreground)",
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{turn.content}</p>
            </div>
          ))}
          <div ref={bottomRef} />

          {lastCoachTurn?.ready_to_finalize && lastCoachTurn.proposed_goal_text && (
            <div className="card" style={{ marginTop: 4 }}>
              <p className="muted" style={{ marginBottom: 4 }}>Propuesta del coach para guardar como meta vigente:</p>
              <p>{lastCoachTurn.proposed_goal_text}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn-primary" onClick={() => finalize(lastCoachTurn.proposed_goal_text!)}>
                  Guardar esta meta
                </button>
                <button onClick={() => setEditing(true)}>Seguir puliendo</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe qué quieres priorizar en este ciclo…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !sending) send();
              }}
              style={{ flex: 1 }}
            />
            <button onClick={send} disabled={sending}>
              {sending ? "…" : "Enviar"}
            </button>
          </div>
          {error && <p className="muted">{error}</p>}
        </div>
      )}
    </div>
  );
}
