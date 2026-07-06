# Programming Engine

> La metodología oficial para crear programas. Define cómo se construyen los bloques.

## Estructura de bloque (4 semanas)

- **Semana 1 — Reentrada:** volumen e intensidad moderados-bajos. Objetivo: reactivar
  patrones de movimiento, evaluar readiness real tras el bloque/deload anterior.
- **Semana 2 — Carga:** incremento de volumen y/o intensidad respecto a semana 1.
  Objetivo: acumular estímulo.
- **Semana 3 — Intensificación:** pico del bloque. Mayor intensidad relativa, volumen
  puede mantenerse o bajar levemente para permitir mayor carga/calidad.
- **Semana 4 — Deload Inteligente:** reducción planificada de volumen e intensidad
  (no eliminación total del estímulo). Objetivo: disipar fatiga, consolidar adaptación,
  preparar el siguiente bloque.

## Duración de programa según la meta

El bloque es siempre de 4 semanas (ver estructura arriba); la **duración de
programa** es un horizonte más largo — 1, 2 o 3 bloques (4, 8 o 12 semanas) —
que el coach sugiere al cerrar la meta vigente con el atleta, para que sepa
cuánto tiempo razonable toma lo que está priorizando:

- **4 semanas (1 bloque):** meta puntual y acotada — consolidar técnica de un
  patrón nuevo, ajuste de calibración tras un cambio de contexto, o una meta que
  es en realidad solo el siguiente bloque natural sin necesidad de planear más
  allá.
- **8 semanas (2 bloques):** meta de magnitud moderada — progresión de fuerza
  visible en 1-2 movimientos principales, avance real de recomposición corporal,
  o consolidación + intensificación de un patrón atlético nuevo (ej. kettlebell).
- **12 semanas (3 bloques):** meta de transformación mayor o rendimiento
  significativo — cambio sustancial de composición corporal, preparar un evento/
  hito específico, o desarrollo integral que requiere una fase de base, una de
  acumulación y una de intensificación real antes de evaluar resultado.

Esta duración es siempre una **sugerencia con razonamiento explícito** en el
momento de guardar la meta — nunca una promesa rígida. Se revisa cada vez que el
atleta define una meta nueva o la meta vigente cambia sustancialmente; no se
recalcula bloque a bloque salvo que el contexto lo amerite.

## Cuándo la Semana 1 no es Reentrada

La Reentrada es la opción segura por defecto — especialmente para atletas nuevos,
sin bloques previos en el sistema, o sin experiencia consolidada. Pero no es
automática ni fija: al generar un bloque nuevo, el motor evalúa evidencia concreta
del bloque anterior (o de su ausencia) antes de decidir la naturaleza de la
Semana 1:

- Atleta sin bloques previos, en retorno de una pausa larga, con dolor articular
  sin resolver, o con adherencia baja/irregular en el bloque anterior → Semana 1
  es Reentrada, sin excepción.
- Atleta con bloque anterior cerrado con buena adherencia, sin dolor articular
  pendiente, RPE dentro de zona productiva sostenida (no sistemáticamente alto), y
  experiencia consolidada en los patrones fundamentales → el motor puede proponer
  que la Semana 1 empiece directamente en nivel de Carga (o una Reentrada breve/
  parcial), explicando la evidencia concreta en `focus_notes`.

Esta decisión siempre se presenta como propuesta explicada al confirmar el
bloque — nunca aplicada en silencio — igual que cualquier otro cambio de bloque
(ver "Siempre presentar recomendaciones de cambio de bloque como propuestas
explicadas" en Coach Behavior). Ante duda o evidencia mixta, el motor opta por
el camino conservador (Reentrada) y lo dice explícitamente en `focus_notes`.

## Distribución de disciplinas

- **Fuerza:** ejercicios principales (compuestos) primero en la sesión, después
  accesorios y unilaterales. 2-4 sesiones de fuerza por semana según bloque.
- **Running:** días fijos no consecutivos (p. ej. jueves y sábado), separados de
  sesiones de fuerza de tren inferior pesado cuando sea posible.
- **Yoga:** días fijos (p. ej. lunes y miércoles), funciona como recuperación activa
  y trabajo de movilidad, no se trata como "día libre".
- **Kettlebells:** se incluyen de forma **obligatoria** en toda sesión de fuerza como
  bloque final de acondicionamiento (10-15 min, nunca omitir). Formato: KB flow,
  EMOM, circuit corto, o carry work — elegido según fatiga acumulada del día y semana
  del bloque. Progresión en complejidad gradual (movimientos actuales de referencia:
  TGU 16 kg, Windmill 24 kg). En semana de deload (semana 4), el bloque KB se reduce
  a 1-2 movimientos de baja intensidad o se sustituye por carries ligeros.
- **Día atlético (viernes):** sesión dedicada a conditioning/athletics/flow, sin fuerza
  pesada. Estructura base: 5-10 min warm up de movilidad → 20-25 min de trabajo
  principal (KB flow complejo, movimientos atléticos, trabajo explosivo de bajo impacto,
  o capacidad aeróbica corta) → 5-10 min cooldown. Intensidad: RPE 6-7. Este día
  complementa los días de fuerza sin competir con su recuperación. En semana de deload,
  puede eliminarse o reducirse a movilidad + KB ligero.

## Progresión y selección de ejercicios

- Progresión por evidencia: técnica sólida + RPE consistente por debajo del objetivo
  → incrementar carga/series/complejidad.
- Selección de ejercicios prioriza patrones fundamentales con buena transferencia
  atlética (sentadilla, bisagra, empuje, tracción, unilateral, carries, core).
- Cambio de ejercicio ocurre por: estancamiento sostenido, dolor articular, aburrimiento
  declarado por el atleta, o necesidad de variación dentro del mismo patrón.

## Idioma del nombre de ejercicio

El `name` de cada ejercicio generado va siempre en su término original en inglés
(ej. "Back Squat", "Romanian Deadlift", "Turkish Get-Up"), aunque el resto de la
sesión (`notes`, `justification`, `summary`) va en español — es como la mayoría
de los atletas conoce y busca estos movimientos, incluso entrenando en español.
No traducir ni inventar un equivalente castellano.

## Tipo de carga por ejercicio

Cada ejercicio se clasifica por cómo se resiste, para que el registro le pida al
atleta el dato correcto: **con peso** (barra/mancuerna/kettlebell/máquina — se
registra el peso de trabajo), **peso corporal** (pull-up, push-up, dip, plancha —
no se pide peso por defecto; solo un peso extra opcional si el atleta agrega
cinto/chaleco/mancuerna) o **banda** (resistencia elástica no cuantificable en
kg/lbs — solo se registran reps/tiempo/distancia, nunca un peso).

## Interpretación de RPE

- RPE 1-5: estímulo insuficiente para progreso — válido solo en reentrada/deload.
- RPE 6-7: zona de trabajo productivo sostenible.
- RPE 8-9: zona de intensificación, usar con moderación y solo en semanas indicadas.
- RPE 10: evitar como práctica habitual; señal de revisión si aparece fuera de contexto.

## Descansos entre series

Todo ejercicio programado especifica su tiempo de descanso entre series: 60-90s en
accesorios/unilaterales, 2-3 min en compuestos pesados (sentadilla, peso muerto,
press), 30-45s en bloques de conditioning/KB (EMOM, circuit, flow). Se ajusta a la
baja en semana de deload y al alza si el RPE reportado sugiere que el atleta llega
fatigado a la siguiente serie.

## Warm ups y cooldowns

- Warm up: movilidad articular específica para la sesión del día + activación +
  series de aproximación progresivas al peso de trabajo.
- Cooldown: movilidad/respiración breve enfocada en las articulaciones más
  exigidas en la sesión.

## Integración de movilidad

La movilidad no es un bloque aislado: vive en warm ups, en yoga, y en trabajo
específico de tobillo/rodilla/cadera/hombro distribuido a lo largo de la semana.
Para la rodilla izquierda (tendinitis cuadricipital), se incluyen de forma
recurrente ejercicios de rehabilitación/mantenimiento articular (estiramiento de
cuádriceps, trabajo de descontractura, fortalecimiento específico) — sin que esto
implique limitar rangos de sentadilla o impacto; el manejo es vía técnica y
cuidado activo, no restricción.

## Manejo de molestias articulares

1. Cualquier reporte de dolor (no solo "lesión") activa revisión inmediata del
   ejercicio asociado.
2. Se reduce rango de carga o se sustituye por variante de menor estrés articular
   en esa misma sesión, no se espera al fin de semana.
3. Se registra la molestia en el perfil del atleta para informar bloques futuros.

## Adaptación ante cambios de contexto

Viajes, falta de equipo, enfermedad, estrés vital alto, o cambios de horario
disparan una versión simplificada del programa (mínimo efectivo) en lugar de
forzar la sesión planificada original.
