"use client";

import { useEffect, useState } from "react";

function titleCase(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function ListEditor({
  items,
  onChange,
}: {
  items: JsonValue[];
  onChange: (next: JsonValue[]) => void;
}) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flex: 1 }}>
            <ValueEditor
              value={item}
              onChange={(v) => {
                const next = [...items];
                next[i] = v;
                onChange(next);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={{ padding: "4px 10px" }}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ""])} style={{ marginTop: 4 }}>
        + Agregar
      </button>
    </div>
  );
}

function ValueEditor({
  value,
  onChange,
}: {
  value: JsonValue;
  onChange: (next: JsonValue) => void;
}) {
  if (Array.isArray(value)) {
    return <ListEditor items={value} onChange={onChange} />;
  }

  if (value !== null && typeof value === "object") {
    return (
      <div style={{ borderLeft: "2px solid rgba(127,127,127,0.2)", paddingLeft: 12 }}>
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="field">
            <label>{titleCase(k)}</label>
            <ValueEditor
              value={v}
              onChange={(nv) => onChange({ ...value, [k]: nv })}
            />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }

  const str = String(value ?? "");
  if (str.length > 70) {
    return (
      <textarea
        value={str}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.min(8, Math.ceil(str.length / 60))}
      />
    );
  }
  return <input value={str} onChange={(e) => onChange(e.target.value)} />;
}

export default function ProfilePage() {
  const [data, setData] = useState<Record<string, JsonValue> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((row) => {
        setData(row?.data ?? {});
        setLoading(false);
      });
  }, []);

  async function save() {
    if (!data) return;
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  if (loading || !data) return <p className="muted">Cargando perfil…</p>;

  const general = data.datos_generales;
  const generalObj = general && typeof general === "object" && !Array.isArray(general) ? general : null;
  const nombre = generalObj?.nombre;
  const statParts = [
    generalObj?.edad != null ? `${generalObj.edad} años` : null,
    generalObj?.altura_m != null ? `${generalObj.altura_m} m` : null,
    generalObj?.peso_actual_kg != null ? `${generalObj.peso_actual_kg} kg` : null,
  ].filter(Boolean);

  return (
    <div>
      {typeof nombre === "string" && nombre ? (
        <>
          <p className="muted" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Perfil
          </p>
          <div className="heading-impact" style={{ fontSize: "2.1rem", marginBottom: 4 }}>{nombre}</div>
          {statParts.length > 0 && (
            <p className="muted" style={{ marginBottom: 20 }}>{statParts.join(" · ")}</p>
          )}
        </>
      ) : (
        <h1 style={{ marginBottom: 8 }}>Perfil del atleta</h1>
      )}
      <p className="muted" style={{ marginBottom: 16 }}>
        Este es el perfil que el motor usa en cada decisión. Edita cualquier campo y guarda — sin código.
      </p>

      {Object.entries(data).map(([section, value]) => (
        <div key={section} className="card">
          <h2 style={{ marginBottom: 10 }}>{titleCase(section)}</h2>
          <ValueEditor
            value={value}
            onChange={(nv) => setData({ ...data, [section]: nv })}
          />
        </div>
      ))}

      <button onClick={save} disabled={saving}>
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
      {saved && <p className="muted" style={{ marginTop: 8 }}>Guardado ✓</p>}
    </div>
  );
}
