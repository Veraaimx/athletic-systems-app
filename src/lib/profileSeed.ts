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
  experiencia: "Avanzado con interrupciones: amplia experiencia en fuerza y funcional, con pausas y retornos. Técnica sólida en movimientos fundamentales.",
  equipo: "Gym completo (barras, racks, máquinas) + kettlebells propios.",
  disponibilidad: "4-5 días/semana, variable. La programación debe ser flexible y poder degradar a mínimo efectivo cuando el contexto lo exige.",
  running: {
    rol: "Complemento al entrenamiento de fuerza, no el objetivo central.",
    volumen_actual: "1-2 veces/semana, ~5k por sesión.",
    dias_previstos: "Jueves y sábado",
  },
  yoga: {
    dias_previstos: "Lunes y miércoles",
    formato: "Clase con instructora en el gimnasio — el motor no programa el contenido, solo la registra como recuperación activa/movilidad.",
  },
  nutricion: "Enfoque intuitivo pero consciente: no cuenta macros activamente, cuida calidad de alimentos y proteína, alineado a recomposición corporal.",
  sueno: {
    estado: "Insuficiente",
    manejo: "Conservador — el sistema solo degrada la sesión si la falta de sueño es notoria/consistente, no ante una mala noche aislada.",
  },
  fortalezas: ["Fuerza en tren superior", "Movilidad/flexibilidad general"],
  debilidades: ["Movilidad de cadera/tobillo", "Trabajo unilateral (posibles desequilibrios lado a lado)", "Capacidad aeróbica"],
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
    "CrossFit (2014–2016)",
    "Entrenamiento de fuerza y funcional (actividad actual principal)",
    "Hiking y ocean safaris",
    "Esquí (temporada de invierno)",
  ],
  preferencias: [
    "Disfruta entrenamiento de fuerza pesada",
    "Disfruta variedad y kettlebells; le aburre la rutina rígida",
    "Prefiere evitar cardio largo y sostenido como actividad principal",
  ],
  aversiones: "Ninguna aversión fuerte declarada.",
  resultado_bloque_anterior: "Bloque previo (Front Squat + RDL, yoga lunes/miércoles, running jueves/sábado): bien, listo para progresar. Buena adherencia y sensaciones.",
};
