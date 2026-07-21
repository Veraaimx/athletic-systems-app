// Structured seed for athlete_profile, mirroring 04-athlete-profile.md in a
// human-readable shape (instead of dumping the raw markdown into one field).
// Edit this file if the *initial* profile content needs to change; ongoing
// edits happen through the /profile page once seeded.
export const ATHLETE_PROFILE_SEED = {
  datos_generales: {
    nombre: "Alonso",
    edad: 34,
    altura_m: 1.75,
    peso_actual_kg: 91,
    peso_objetivo_kg: 85,
    nota_peso: "Recomposición corporal — bajar % de grasa, no solo bajar de peso.",
  },
  objetivos: [
    "Recomposición corporal (91 kg → ~85 kg, bajar % grasa)",
    "Rendimiento atlético híbrido (fuerza + running + movilidad integrados)",
    "Longevidad articular (entrenar fuerte de forma sostenible)",
  ],
  identidad_atletica:
    "Strength-biased Hybrid Outdoor / Tactical Outdoor / Adaptive Athlete: fuerza máxima y relativa como base, con engine, potencia, movilidad, unilateralidad y resiliencia articular para surf, hiking, ski/snowboard, deportes espontáneos y vida física real. No busca pesas + cardio al azar ni WODs ligeros; busca preparación física de atleta generalista.",
  metas_especificas: [
    "Running: bajar el ritmo de 5K a menos de 5:00 min/km",
    "Natación: construir una base real de nado continuo (hoy no es una habilidad entrenada)",
    "Agilidad: mejorar cambios de dirección y coordinación reactiva",
    "Flexibilidad: aumentar rango de movimiento general, prioridad cadera/tobillo/hombro",
    "Potencia atlética: reintroducir saltos, lanzamientos, sprints cortos o derivados olímpicos según tolerancia articular y técnica",
  ],
  enfoque_entrenamiento:
    "Strength-biased hybrid: fuerza funcional/atlética como base de cada bloque, conditioning con intención (strength endurance, metabolic capacity, power endurance o mixed modal), potencia y movilidad/durabilidad integradas. Puede usar hipertrofia dirigida donde sirva a recomposición y balance estructural, pero no bodybuilding puro ni solo funcional.",
  deportes_a_soportar: ["Surf", "Snowboard", "Cabalgatas (equitación recreativa)", "Básquetbol", "Snorkel", "Buceo (scuba)"],
  experiencia:
    "Avanzado con interrupciones: amplia experiencia en fuerza y funcional, con pausas y retornos. Técnica sólida en movimientos fundamentales, incluye base de halterofilia (snatch, clean & jerk) y gimnasia (pull-ups estrictos, algo de ring work/kipping) de su etapa de CrossFit — no es principiante en esos patrones aunque estén oxidados.",
  equipo: "Gym completo: barras, racks, máquinas, kettlebells propios, sled (solo empuje — no hay cuerdas/arnés para jalar por ahora), assault bike, remadora (rowing machine), box de salto (plyo box), balones medicinales, caminadoras. No disponible: sandbag, ski erg.",
  disponibilidad: "4-5 días/semana, variable. La programación debe ser flexible y poder degradar a mínimo efectivo cuando el contexto lo exige.",
  running: {
    rol: "Complemento al entrenamiento de fuerza, no el objetivo central.",
    volumen_actual: "1-2 veces/semana, ~5k por sesión.",
    dias_previstos: "Sin días fijos — el motor los ubica según necesidad del bloque (no consecutivos, separados de fuerza pesada de tren inferior cuando sea posible). A diferencia del yoga, esto no es restricción de horario del atleta.",
    nota_programacion:
      "Cualquiera de los 2 días puede evolucionar a Hybrid Day: running + strength endurance, tempo + potencia, Zone 2 + accesorios/carries, mixed modal, o Compromised Workout (estación inmediatamente después del tramo de running, sin pausa) según semana y recuperación.",
  },
  yoga: {
    dias_previstos: "Lunes y miércoles — única restricción de horario no negociable del atleta (depende de clase con instructora); a diferencia de running, estos días no se mueven.",
    formato: "Clase con instructora en el gimnasio — el motor no programa el contenido, solo la registra como recuperación activa/movilidad.",
    nota_fatiga: "Ante todo movilidad, respiración y mentalidad — exigencia física real pero de otra naturaleza, no genera la misma fatiga sistémica que un WOD. El complemento KB de estos días es el lugar más seguro del bloque para introducir vocabulario nuevo, no compite por recuperación con nada.",
    estructura_complemento: "Dos partes, tope total 25 min: flow KB compacto (~12 min, rotación/core del banco) + bloque de hipertrofia dirigida (~10-12 min) — lunes hombros/tríceps, miércoles pecho/bíceps. Estética de hombros/pecho/brazos es objetivo secundario declarado (2026-07).",
  },
  nutricion: "Enfoque intuitivo pero consciente: no cuenta macros activamente, cuida calidad de alimentos y proteína, alineado a recomposición corporal.",
  sueno: {
    estado: "Insuficiente",
    manejo: "Conservador — el sistema solo degrada la sesión si la falta de sueño es notoria/consistente, no ante una mala noche aislada.",
  },
  fortalezas: ["Fuerza en tren superior", "Movilidad/flexibilidad general"],
  debilidades: [
    "Movilidad de cadera/tobillo",
    "Trabajo unilateral (posibles desequilibrios lado a lado)",
    "Capacidad aeróbica",
    "Potencia atlética y coordinación/reactividad",
    "Estabilidad lumbar bajo fatiga",
    "Resiliencia específica de rodilla",
  ],
  prioridad_programacion:
    "Las debilidades identificadas y la rehab/recuperación de lesiones activas van primero al diseñar cada bloque — se programan antes que la novedad o la variedad, y el resto del volumen se construye alrededor de ellas, no al revés.",
  lesiones: {
    rodillas: {
      resumen: "Dolor más frecuente/intenso en rodilla izquierda, tendón del cuádriceps. Desgaste articular y tendinitis diagnosticados clínicamente.",
      manejo: "Sin restricción de rango ni prohibición de movimientos. En tratamiento con fisioterapeuta. Rehab activa integrada en rutinas (estiramiento de cuádriceps, descontractura, fortalecimiento específico).",
    },
    hombros: {
      resumen: "Sensibilidad reciente y mínima en hombro derecho, apareció tras surfear. No limita el movimiento.",
      manejo: "Vigilar sin sobre-reaccionar; señal de baja prioridad, registrar en logs semanales.",
    },
    espalda_baja: {
      resumen: "Hernia discal en L5-S1 hace ~4 años, aparentemente reabsorbida. Rango normal, sin dolor al despertar.",
      manejo: "Prioridad alta y transversal: estabilidad de core y control lumbar como base de toda la programación de fuerza. Vigilar volumen/intensidad de bisagra de cadera.",
    },
    tobillos: {
      resumen: "Antecedente de esguinces (básquetbol en preparatoria).",
      manejo: "Candidato a trabajo específico de movilidad/estabilidad de tobillo.",
    },
  },
  historial_deportivo: [
    "Surf desde los 15 años (recreativo, ocasional)",
    "Básquetbol en preparatoria (origen de esguinces de tobillo)",
    "CrossFit (2014–2016): incluyó halterofilia (snatch, clean & jerk) y gimnasia (pull-ups estrictos, algo de ring work/kipping)",
    "Entrenamiento de fuerza y funcional (actividad actual principal)",
    "Hiking y ocean safaris",
    "Esquí (temporada de invierno)",
  ],
  preferencias: [
    "Disfruta entrenamiento de fuerza pesada",
    "Disfruta variedad y kettlebells; le aburre la rutina rígida",
    "Prefiere evitar cardio largo y sostenido como actividad principal",
  ],
  aversiones:
    "Una sola aversión real, de arquitectura: que la programación se vuelva bodybuilding clásico — split por grupos musculares, aislamiento como eje central, volumen de espejo sin transferencia atlética. NO está en contra de la hipertrofia: quiere desarrollo muscular real en hombros, pecho, brazos y piernas, y el trabajo dirigido a esos grupos es bienvenido mientras viva dentro de un sistema atlético (hombros/tríceps y pecho/bíceps en días de yoga, accesorios de pierna al cierre del día de fuerza inferior, empuje funcional en conditioning). No hay cuota fija de ejercicios por grupo muscular. Segunda aversión: no HIIT estilo CrossFit tradicional (WODs aleatorios sin intención declarada).",
  resultado_bloque_anterior: "Bloque previo (Front Squat + RDL, yoga lunes/miércoles, running jueves/sábado): bien, listo para progresar. Buena adherencia y sensaciones.",
};
