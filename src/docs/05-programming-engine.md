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

**Cuando la Semana 1 salta la Reentrada, las demás semanas conservan su rol:**
S1 = Carga, S2 = Carga (progresión sobre S1), S3 = Intensificación, S4 =
Deload Inteligente. Saltar la Reentrada no convierte el bloque en dos semanas
de intensificación — **hay exactamente una semana de Intensificación por
bloque (la S3)**, porque el pico requiere la acumulación previa de S1-S2 y el
deload posterior para absorberse. Etiquetar S2 como "Intensificación" es un
error de estructura, no una progresión más agresiva.

## Distribución de disciplinas

- **Fuerza:** ejercicios principales (compuestos) primero en la sesión, después
  accesorios y unilaterales. 2-4 sesiones de fuerza por semana según bloque.
  El día de fuerza inferior cierra con **hipertrofia dirigida de pierna** — ver
  regla dedicada abajo.
- **Running:** sin días fijos — el motor elige 2 sesiones/semana no consecutivas según
  lo que el bloque necesite, separadas de fuerza de tren inferior pesado cuando sea
  posible. A diferencia del yoga, esto no es una restricción de horario del atleta,
  es una decisión de programación y puede cambiar de bloque a bloque.
- **Yoga:** días fijos (lunes y miércoles) — única restricción de horario no
  negociable del atleta, por depender de clase con instructora. Funciona como
  recuperación activa y trabajo de movilidad, no se trata como "día libre".
  El complemento post-clase (tope total 25 min) se compone de dos partes:
  **flow KB compacto (~12 min)** con la variedad de rotación/core del banco, y
  **bloque de hipertrofia dirigida (~10-12 min)** — objetivo estético
  secundario declarado del atleta: lunes = hombros (Lateral Raise, Rear Delt
  Fly) + tríceps; miércoles = pecho (Incline DB Press o push-up con carga) +
  bíceps. Frecuencia 2×/semana por grupo, dosis corta — es remate estético
  sobre el volumen indirecto que ya existe (OHP, push-ups, plyo), no un giro
  a bodybuilding.
- **Descanso:** el domingo es descanso completo y aparece **explícito** en el
  plan del bloque (type "descanso"), no implícito por omisión. Además, como la
  disponibilidad real del atleta es 4-5 días/semana (no 6), cada semana marca
  1-2 sesiones como **flexibles** — candidatas a saltarse sin penalidad si la
  semana real solo da para 4-5 días (candidatos naturales: el complemento KB
  de un día de yoga, o el segundo run de la semana). El plan asume la semana
  buena; la semana real manda.
- **Hipertrofia dirigida de pierna:** el día de fuerza inferior cierra con 2
  accesorios de aislamiento (~5-6 min, rango 10-15 reps) — **no un bloque
  extenso**. Los compuestos y unilaterales del día (Front Squat 4×5, BSS
  4×7/lado, SL-RDL 3×8/lado) ya entregan volumen en rango de hipertrofia: lo
  que falta no es volumen, es cobertura de dos músculos específicos.
  (1) **Isquios por flexión de rodilla** — RDL y SL-RDL son extensión de
  cadera y trabajan el isquio como extensor, no como flexor; Leg Curl o Nordic
  asistido llena ese hueco. (2) **Pantorrilla** — debilidad declarada del
  atleta (fatiga rápida y calambres al correr), hoy solo presente como dosis
  de mantenimiento en cooldown; Calf Raise 3×15 alternando de pie y sentado
  entre bloques. Ambos son de fatiga sistémica baja (sin carga axial, sin
  demanda de CNS), por eso caben aquí sin competir con la recuperación de los
  compuestos — agregar extensiones no es lo mismo que agregar sentadillas.
  Si en algún bloque falta desarrollo de cuádriceps, la vía correcta **no** es
  apilar más accesorios: es cambiar el estímulo de lo que ya está (subir BSS a
  rango 8-10, o rotar a Hack Squat como variante principal).
- **Kettlebells:** se incluyen de forma **obligatoria** en toda sesión de fuerza como
  bloque final de acondicionamiento (10-15 min, nunca omitir). Formato: KB flow,
  EMOM, AMRAP + core rotacional, circuit corto, o carry work — elegido según fatiga
  acumulada del día y semana del bloque. Progresión en complejidad gradual (ver
  "Banco de vocabulario de movimiento" abajo). En semana de deload (semana 4), el
  bloque KB se reduce a 1-2 movimientos de baja intensidad o se sustituye por carries
  ligeros.
- **Día atlético (viernes):** sesión dedicada a conditioning/athletics/flow, sin fuerza
  pesada. Estructura base: 5-10 min warm up de movilidad → 20-25 min de trabajo
  principal (KB flow complejo, movimientos atléticos, trabajo explosivo de bajo impacto,
  circuito clásico, o **running clock con ventanas** — bloques fijos de trabajo/AMRAP/
  rest dentro de un reloj corrido, ej. 3 min trabajo → 3 min rest, repetido — para variar
  el estímulo sin caer en WOD aleatorio) → 5-10 min cooldown. Intensidad: RPE 6-7. Este
  día complementa los días de fuerza sin competir con su recuperación. En semana de
  deload, puede eliminarse o reducirse a movilidad + KB ligero.
- **Hybrid Day (running + athletic conditioning):** cuando la identidad/meta lo pide y
  la recuperación lo permite, un día de running puede dejar de ser "solo 5K" y volverse
  una sesión mixta con intención: run + strength endurance, tempo + potencia, Zone 2 +
  accesorios/carries, mixed modal, o **Compromised Workout** (estación funcional
  inmediatamente después de un tramo de running, sin pausa entre ambos — ej. 1km run →
  farmer carry → 1km run → sled push — entrena moverse bien bajo fatiga real en vez de
  solo acumular volumen de cada cosa por separado). No debe competir con lower strength
  pesado ni convertirse en HIIT sin estructura.

## Banco de vocabulario de movimiento (kettlebell y core)

Vocabulario disponible para el motor — no es preferencia del atleta ni cuota
obligatoria, se selecciona según el patrón/plano de movimiento que el bloque
necesite, igual que cualquier otro ejercicio.

- **Familia de snatch y swing (fundamental + variantes):** KB Snatch (single-arm,
  fundamental — base de toda la familia), Windmill Snatch, Snatch Twist,
  Squat Swing Snatch, Lunge Snatch, Skier Snatch, American Twist Swing,
  Step-Back Swing, Alternating Ski Swing, Hand-to-Hand Lateral Swing.
- **Rotación / anti-rotación de torso:** High Elbow Twist, Squat Twist Pullover,
  Split Stance Chops, Pallof Rotations, KB Chop (diagonal explosivo, cintura a
  hombro contrario), B-Stance Rotational Chops, Half-Kneeling KB Rotational
  Woodchops, Curtsy Lunge + Uppercut, Rotational Clean, Cross-Body High Pull.
- **Core / control lumbar:** Turkish Sit-Up, Iso Press + Leg Raise, Oblique V-Up,
  Hanging Oblique Knee Tuck, Turkish Get-Up (TGU), Single-Arm Overhead Iso Hold
  Sit-Up, Hip Crawl con Single-Arm Overhead Iso Hold.
- **Unilateral / estabilidad:** Kickstand Windmill Squat, overhead single-arm
  stability lunge, Bulgarian Split Squat, Cossack Squat, Single-Leg Press,
  Isometric Lunge con Contralateral Press.
- **Complejos multiplanares:** Deep Squat Hold Curl-Press + Lateral Flexion, Sumo
  Tricep Extension, Seesaw Press, Hand-to-Hand passing, Overhead Sumo Squat
  Complex (knee drops + tricep extension + backward bend), Clean → Reverse
  Lunge → Press, Split-Stance Clean to Hunter Squat, Squat-Down Bent-Over
  Press, Windmill Press, Figure Eight into Press, Flexion to Extension High
  Pull, Alternating Same-Hand Press (in/out).
- **Halos / giros de muñeca:** Alternating Halo, Seated KB Halos, Half-Kneeling
  Halo to Press, Non-Stop Around the World. Nota: la variante con steel mace
  (Mace 360s) requiere equipo que el atleta no tiene — usar siempre estas
  versiones con kettlebell.
- **Empuje funcional y brazos (dentro de conditioning):** Push-Up (estricto,
  close-grip, incline), Plyo Push-Up, Navy SEAL Push-Up (push-up → knee drive
  alternado → burpee), Push-Up to Low Squat Hold + Forward Press, KB Floor
  Press, KB Curl dentro de flows/circuitos, Ballistic Row. **Aclaración
  importante de alcance:** la regla de "máximo 2 ejercicios de bíceps por
  bloque" aplica a slots de aislamiento dentro de las sesiones de fuerza — el
  trabajo funcional de pecho/brazos dentro de circuitos de conditioning
  (push-ups, plyo, KB curls en un flow) NO cuenta contra esa cuota. Lo que el
  atleta no quiere es volumen de hipertrofia estilo bodybuilding (aislamiento
  de espejo), no ausencia total de pecho y brazos: el empuje funcional bajo
  fatiga es parte legítima del conditioning atlético y aparece constantemente
  en los formatos de referencia.
- **Carries y estaciones (equipo real disponible):** Farmer's Carry, Sled Push
  (solo empuje — no hay cuerdas/arnés para jalar), Wall Balls, Burpee Broad
  Jump, Box Jump (dosis conservadora, ver nota de impacto abajo), Assault Bike
  intervals, Row (remadora), Medicine Ball Slam/Throw. No usar Sandbag Carry
  ni Ski Erg — no disponibles.

**En espera (no programar todavía):** Handstand Walk, Bar/Ring Muscle-Up, Pistol
Squat — habilidades de alta demanda de hombro/rodilla; reevaluar cuando la rodilla
izquierda y el hombro derecho estén sin molestia sostenida por varios bloques.

**Cues de ejecución para movimientos no estándar (regla de claridad):** todo
movimiento del banco que no sea de nombre universalmente conocido (los que
vienen de creadores específicos: Hip Crawl con Iso Hold, Kickstand Windmill
Squat, B-Stance Rotational Chops, etc.) debe incluir en el summary de la
sesión **1-2 líneas de cómo ejecutarlo** (posición inicial → acción → qué
cuidar), porque el atleta puede no encontrarlo en video — ya ocurrió: reportó
en logs no entender un movimiento ni hallarlo en YouTube. Un movimiento que el
atleta no puede ejecutar por falta de referencia es peor que uno repetido.

**Logs de carga vs. variedad de vocabulario — no son lo mismo.** El historial de
logs (RPE, peso, dolor) del bloque anterior existe para decidir progresión de
**carga** en los movimientos de fuerza — no es una lista blanca implícita de
"lo único seguro de programar". Un movimiento del banco de arriba sin logs
previos no es un movimiento no probado o riesgoso, es simplemente uno que el
atleta todavía no registró: se programa igual que cualquier otro, empezando en
carga/complejidad conservadora si es genuinamente nuevo.

**Cuota mínima de variedad (regla verificable, no solo intención):** cada
bloque de 4 semanas debe incluir al menos 3-4 movimientos del banco de
vocabulario que no aparecieron en los logs del bloque anterior. Repetir bloque
tras bloque solo lo que ya tiene logs estanca el conditioning exactamente en
lo que "Programación strength-biased hybrid" pide evitar.

**Estructura mínima de finishers y circuitos (regla verificable):** el
finisher KB de los días de fuerza y el circuito del día atlético se componen
de **4-6 movimientos full-body** en formato EMOM/AMRAP/circuit de 12-20
minutos, opcionalmente cerrados con un core finisher de 2 movimientos — el
formato de los ejemplos de referencia (ej. EMOM 20 min: rotational hand-to-hand
pulls + curtsy lunges + rotational cleans + single-leg presses, × 5 rondas +
core finisher). Un EMOM de solo 2 movimientos es formato de deload, no de
semana de trabajo: en S1-S3 se considera subdimensionado. Los 4-6 movimientos
deben cubrir más de un patrón (no 6 variantes del mismo swing) e incluir
regularmente empuje funcional (push-up/plyo/floor press) — es la vía prevista
para trabajar pecho y brazos sin volumen de aislamiento.

**Ubicación de isométricos (regla de colocación):** los isométricos tienen
tres casas legítimas — (1) warm-up como activación corta y submáxima (ej. VMO
iso), (2) slots de rehab/tendón donde el hold con carga es protocolo formal
(ej. Spanish Squat, Wall Sit para tendinopatía), y (3) core finishers
dedicados al cierre (Hollow Hold, planks). **Nunca como estación dentro de un
circuito/EMOM/AMRAP dinámico de conditioning** — ahí toda estación debe ser
movimiento cíclico o continuo (los carries cuentan como continuos); un hold
estático dentro de un EMOM es un minuto muerto para la intención del formato,
y ninguno de los formatos de referencia lo hace.

**Sin duplicados en la misma sesión (alcance completo):** un ejercicio
aparece **una sola vez por sesión**, sin importar en qué pieza — warm-up,
bloque principal, finisher, circuito o benchmark. Dos piezas de conditioning
de la misma sesión tampoco repiten ejercicio entre sí. Repetir el mismo
ejercicio dos veces en una sesión es volumen duplicado sin propósito (el
"junk volume" que Viada pide eliminar).

**El día de benchmark, el benchmark ES el conditioning de la sesión:**
reemplaza al circuito/finisher de ese día, no se suma encima. Un circuito
completo + un AMRAP de benchmark en la misma sesión es exceso de volumen de
conditioning y contamina la medición (el benchmark debe correrse en
condiciones comparables entre S1 y S3, no tras 25 min de circuito previo).

**Calibración de densidad por RPE reportado (regla de ajuste):** las reps de
cada estación de un EMOM se dimensionan para ~40-45 seg de trabajo por minuto
— si el atleta termina en 20 seg, la dosis está mal puesta. Si los logs
reportan tiempo sobrante notorio o RPE 1-2 puntos por debajo del objetivo, la
semana siguiente escala densidad/reps **más allá** de la progresión planeada
originalmente — la rampa se recalibra con la evidencia, no se sigue por
inercia. Señal ya observada en este atleta: estaciones de salto de EMOM
terminadas "muy rápido" con tiempo muerto, y el finisher convertido por
iniciativa propia en circuito for-time sin descanso. Ante la duda entre EMOM
espaciado y circuito continuo/for-time, preferir el circuito continuo — es el
formato que el atleta busca y el que usan los referentes.

## Rotación semanal de conditioning por bloque

Para que el conditioning no se quede fijo en el mismo formato semana tras
semana, cada semana del bloque tiene una intención de conditioning distinta,
inspirada en un enfoque de referencia específico:

- **Semana 1 (Reentrada/Carga):** Strength Endurance — carries + fuerza bajo
  fatiga moderada (Farmer's Carry, Sled Push, Row).
- **Semana 2 (Carga Alta):** Power Endurance — saltos, lanzamientos y sled
  combinados con bike/row. Impacto (Box Jump) entra con dosis conservadora,
  altura baja y aterrizaje controlado, dada la rodilla izquierda — no se evita,
  se dosifica (ver "Integración de movilidad" y "Manejo de molestias
  articulares").
- **Semana 3 (Intensificación):** Metabolic Capacity estilo Hyrox — Wall
  Balls, Sled Push, Assault Bike, Row, o un **Compromised Workout** real
  (estación inmediatamente después de running/engine, sin pausa).
- **Semana 4 (Deload):** Mixed Modal ligero — KB flow de baja intensidad y
  movilidad, sin buscar estímulo nuevo.

**La categoría de la semana aplica a TODO el conditioning de esa semana, no
solo a un slot.** El finisher KB de los días de fuerza (ej. martes) y el
circuito dedicado del día atlético (ej. viernes) deben reflejar la misma
categoría semanal — si S2 es Power Endurance, el finisher del martes también
cambia a Power Endurance, no se queda fijo en Strength Endurance mientras solo
el viernes rota. Dejar un slot fijo mientras el otro rota no es variedad real,
es la mitad del problema con un disfraz.

**Progresión de carga ≠ progresión de complejidad — no confundir una con
otra.** Repetir exactamente el mismo EMOM (mismos 2 movimientos) subiendo solo
reps o distancia semana a semana no es la progresión que pide "Programación
strength-biased hybrid" ("sube en densidad, complejidad o especificidad, no en
caos"): es progresión de carga, la misma lógica que ya se aplica a los
movimientos de fuerza. El conditioning necesita su propio eje de progresión —
cambiar qué se hace, no solo cuánto — para reflejar el cambio real de
categoría semanal.

Los tres coaches de referencia (Alex Viada, Training Think Tank, Sebastian
Oreb) se complementan en capas distintas del sistema — no compiten entre sí ni
se contradicen: **Oreb** define la base de fuerza no negociable (qué patrones
son innegociables, entrenar con reps in reserve); **Viada** define cómo
combinar fuerza y conditioning sin que uno destruya al otro (secuencia
same-day, High-Low Strategy, volumen mínimo efectivo); **Training Think Tank**
define cómo individualizar y reevaluar semana a semana con evidencia real
(quién es el limitante actual). Ninguno de los tres dicta qué movimientos usar
en el conditioning — eso lo cubren el banco de vocabulario y esta rotación.

**Importante — la rotación/variedad de esta sección NO aplica a los 5
movimientos ancla de fuerza (Front Squat, RDL, Bulgarian Split Squat, Pull-Up,
Overhead Press).** Ahí rige Oreb al revés de como rige aquí: la consistencia
del movimiento es lo que permite medir progreso real bloque a bloque — esos 5
patrones se mantienen fijos y progresan en carga/reps, no se rotan ni se
sustituyen por variedad. La rotación semanal es exclusivamente del
conditioning/athletic (KB finishers, circuitos, engine) — un eje aparte que no
contradice ni compite con la consistencia de los movimientos ancla.

**Benchmark de conditioning (evita "junk volume", principio de Viada).** Así
como la fuerza se mide en libras a través del bloque, el conditioning necesita
su propia métrica objetiva — sin eso, "más variedad" puede volverse ruido sin
dirección. Cada bloque de 4 semanas incluye 1 benchmark de conditioning fijo,
con el mismo protocolo exacto (mismos movimientos, misma carga, mismo formato
de tiempo), repetido en **Semana 1 y Semana 3** (antes del deload) para que el
resultado sea directamente comparable — ej. un AMRAP de 12 min con 3-4
movimientos fijos (contar rondas/reps completadas), o un circuito for-time
fijo (medir tiempo total). Las 2 semanas de separación son parte del diseño:
programarlo en semanas consecutivas (ej. S2→S3) no deja tiempo real de
adaptación entre mediciones y convierte la comparación en ruido — S1 y S3, no
otras combinaciones. El benchmark se elige según la categoría de
conditioning que el bloque esté priorizando (Strength Endurance, Power
Endurance, Metabolic Capacity) y se mantiene idéntico dentro del bloque
específicamente para poder medir — la variedad de la rotación semanal vive en
las sesiones de entrenamiento normales, no en el benchmark.

Esta rotación cambia el **contenido/formato** del conditioning, no la regla de
desempate fuerza-vs-conditioning ya establecida (la fuerza sigue protegida por
defecto ante conflicto de recuperación, salvo la excepción revisable por
evidencia de limitante real) — son ejes distintos: uno decide qué cede cuando
hay conflicto de recuperación, el otro decide qué variedad de estímulo usa el
conditioning esa semana cuando no hay conflicto.

## Programación strength-biased hybrid

Para atletas cuya identidad combina fuerza como base + capacidad metabólica alta
(ej. strength-biased Hybrid Outdoor, Tactical Hybrid), la regla es:

- La fuerza máxima/relativa se protege como capacidad base: compuestos, unilaterales,
  carries pesados y core siguen teniendo prioridad.
- El conditioning sube en densidad, complejidad o especificidad, no en caos. Debe
  desarrollar fuerza bajo fatiga, capacidad anaeróbica, potencia, resistencia muscular
  o engine.
- El programa evita dos errores: volverse powerlifting + cardio mínimo, o volverse
  metcon/HIIT que erosiona fuerza, técnica y articulaciones.
- Cada semana debe tocar, en dosis razonable para el bloque: fuerza, engine, movilidad/
  durabilidad, trabajo unilateral y alguna expresión de potencia/athleticism si el
  atleta la tolera.

Un reparto orientativo para un perfil outdoor strength-biased puede ser:

- 40-50% strength.
- 20-30% conditioning/engine.
- 10-20% power/athleticism.
- 10-20% mobility/durability.

Estos porcentajes son brújula, no fórmula rígida. La meta vigente y los logs mandan.

Principios adicionales de secuenciación e intensidad para este perfil:

- **Secuencia same-day:** cuando fuerza y conditioning/running caen el mismo día,
  fuerza va primero — preserva mejor la adaptación de fuerza que el orden inverso.
- **High-Low Strategy:** los días de mayor estrés (fuerza pesada, Hybrid Day) se
  agrupan con al menos un día de menor estrés entre medio (yoga, movilidad, día
  atlético moderado) para permitir ~48h de recuperación sistémica real, en vez de
  repartir intensidad alta todos los días.
- **80/20 de intensidad en conditioning:** la mayoría del volumen de engine/
  conditioning debe sentirse controlado (RPE 6-7 o menor), reservando esfuerzo
  verdaderamente alto para 1 sesión/semana. Conditioning no es sinónimo de ir al
  máximo cada vez.
- **Reps in reserve:** no entrenar al fallo como práctica habitual, ni en fuerza ni
  en conditioning — dejar 1-2 reps en reserva preserva calidad técnica y permite
  progresión sostenida bloque tras bloque.
- **Base no negociable:** sentadilla, bisagra (deadlift/hinge), empuje (horizontal/
  vertical) y tracción vertical (pull-up/chin-up) son los 4 patrones que siempre
  deben tener representación en el bloque, sin importar qué tan variado sea el
  resto de la programación.
- **Regla de desempate ante conflicto de recuperación:** por defecto, protege el
  volumen mínimo efectivo de fuerza — si el conditioning de una semana compromete
  el estímulo objetivo de los movimientos principales, el conditioning es lo que se
  recorta, porque esa señal indica que su volumen creció más de lo necesario, no
  que la fuerza deba ceder por una jerarquía fija. Esto **no** es una regla fija
  para todo el bloque: si los logs muestran que el limitante real del atleta en ese
  momento es otra capacidad (ej. capacidad aeróbica, cuando está declarada como
  debilidad), el motor puede proteger esa capacidad esa semana en su lugar — la
  decisión se reevalúa semana a semana con evidencia real (RPE, logs, sensación),
  nunca se fija de una vez para las 12 semanas.

## Progresión y selección de ejercicios

- Progresión por evidencia: técnica sólida + RPE consistente por debajo del objetivo
  → incrementar carga/series/complejidad.
- Selección de ejercicios prioriza patrones fundamentales con buena transferencia
  atlética (sentadilla, bisagra, empuje, tracción, unilateral, carries, core).
- Cambio de ejercicio ocurre por: estancamiento sostenido, dolor articular, aburrimiento
  declarado por el atleta, o necesidad de variación dentro del mismo patrón.

## Conditioning con intención

No programar WODs aleatorios ni circuitos "para sudar". Todo conditioning debe declarar
qué capacidad desarrolla:

- **Strength Endurance:** trabajo sostenido con fuerza bajo fatiga. Ejemplos: row +
  front rack walking lunges + swings + pull-ups + farmer carry, con descansos claros.
- **Metabolic Capacity:** estilo HYROX/tactical sin copiar estaciones por moda: sled
  push, wall balls, row/run/assault bike, cargas y pacing ajustados al atleta.
- **Power Endurance:** jumps/throws/sprints cortos combinados con assault bike/row/sled
  push, cuidando calidad de movimiento.
- **Mixed Modal:** run + fuerza/carries/core o máquinas + fuerza, con objetivo energético
  definido.

**Formatos de estructura disponibles** (organizan el tiempo, no son una capacidad en sí):

- **Circuito clásico:** rondas fijas con descanso definido entre ejercicios.
- **EMOM / AMRAP:** ventana de tiempo fija, con o sin remate de core rotacional al cierre.
- **Running clock con ventanas:** reloj corrido con bloques de trabajo/AMRAP/rest
  predefinidos — útil para variar el estímulo del Día Atlético sin caer en WOD aleatorio.
- **Compromised Workout:** estación inmediatamente después de un tramo de running/engine,
  sin pausa — reservado para Hybrid Day, entrena rendimiento bajo fatiga real.

Una sesión robusta no es una sesión destructiva. Debe tener warm up, bloque principal,
descansos definidos, RPE objetivo y justificación de por qué esa mezcla sirve para la
identidad y la meta del atleta.

## Athletic performance semanal

Cuando el atleta tiene objetivo outdoor/tactical/hybrid, el motor busca tocar estas
capacidades cada semana, ajustando dosis:

- Fuerza máxima o fuerza relativa (2-3 estímulos según bloque).
- Trabajo unilateral real: Bulgarian Split Squat, Step-Up, Single Leg RDL, Cossack Squat,
  Single Leg Calf Raise u otras variantes pertinentes.
- Core y estabilidad lumbar: anti-rotación, anti-extensión, carries y control de bisagra.
- Engine: Zone 2, tempo/threshold, intervalos, hill/sled/KB complexes según contexto.
- Potencia/athleticism: broad jumps, med ball throws, sprints cortos, cambios de dirección
  o derivados olímpicos seguros.
- Durabilidad articular: tobillo, rodilla, cadera, hombro y columna torácica integrados.

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

Para perfiles con historial de rodilla/tobillo/lumbar y objetivo outdoor/tactical,
la durabilidad se trata como capacidad a construir ("armor building"), no como simple
lista de restricciones. Ejemplos recurrentes según tolerancia: Spanish Squat, Isometric
Wall Sit, Peterson Step-Up, Sled Push (excéntrico controlado en el retorno),
Tibialis Raise, calf raises, core anti-rotación y movilidad activa de
cadera/tobillo.

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
