# Athletic Systems Training (AST) — Design System
**V1.2 (borrador) · 2026-07-04 · Alonso Sarmiento**

> Cambios en esta revisión: nombre y tagline confirmados (§0), moodboard de referencias
> visuales (§0.1), recomendación de color con base en psicología del color (§2.1, aplicada
> en código), tono "estoico/Dark Knight" + conciencia cuerpo-mente-emoción + regla de
> vocabulario en dos capas (§1).

> Fuente: extraído del código vivo (`app/src/app/globals.css`, `app/src/app/layout.tsx`,
> `app/src/components/`) el 2026-07-04. Las secciones marcadas **[DRAFT]** son propuestas
> mías pendientes de tu validación, no hechos ya decididos. Las marcadas **[TBD]** son
> huecos reales — no existen todavía en ningún lado.

---

## 0. Estado de la identidad de marca

| Elemento | Estado |
|---|---|
| Nombre / naming final | **[x] Confirmado (2026-07-04)** — Athletic Systems Training, abreviado **AST**. Aplicado en `layout.tsx` (metadata) y `AppNav.tsx` (`.sidebar-brand`) |
| Tagline | **[x] Confirmado (2026-07-04)** — *"Your body leads. The program follows."* En inglés, deliberado: nombre y tagline funcionan como capa de marca en inglés sobre un producto que opera en español (`lang="es"`) — no es un descuido, es una decisión de dos capas de idioma, común en apps con ambición más allá de un solo mercado |
| Logo / isotipo | **[TBD]** — no existe ningún archivo; hoy la "marca" es solo el wordmark en texto ("AST", `.sidebar-brand`, Space Grotesk 600). Ya desbloqueado para arrancar — dependía del nombre, que ya está resuelto |
| Voz y tono de marca | **[DRAFT] Muy avanzado** — base + registro estoico/Dark Knight + conciencia cuerpo-mente-emoción, todo en §1. Falta verlo aplicado a copy real de la app (pendiente en `PENDIENTES.md`) |
| Modo claro | **[TBD]** — no existe, `color-scheme: dark` está fijo en `globals.css:34`. Confirmado que no es prioridad, dark-mode-only |

El único hueco real que queda es el logo/isotipo — y ya no tiene ninguna dependencia
bloqueándolo.

### 0.1 Referencias visuales (moodboard aportado por Alonso, 2026-07-04)

6 referencias de apps/sitios de fitness. Patrón compartido por las 6, no importa cuál acento
usen — esto es lo que define el "género" visual, más que el color específico de cada una:

- **Base casi-negra + un solo acento saturado dominante.** Ninguna de las 6 mezcla más de
  1-2 colores de acento a la vez. Esto es evidencia directa a favor de reducir nuestra
  paleta (§2.1) — el "look bold" viene de la restricción de color, no de tener más colores.
- **Tipografía display bold/condensada para headlines de impacto**, a veces en mayúsculas
  ("BUILD YOUR BEST SELF", "TRAIN HARD. STAY STRONG."). Nuestro `h1` actual (1.7rem/600)
  es correcto para headings de sección, pero es más discreto que estos heroes — ver
  propuesta de "heading de impacto" en §2.2.
- **CTAs en pill sólido**, siempre rellenos del color de acento, nunca solo contorno.
- **Anillo de progreso circular como motivo recurrente** (3 de 6 referencias lo usan para
  "% completado" / actividad diaria) — ya lo tenemos construido (`progress-ring-tiles`),
  solo hay que asegurarnos que el acento que lo llena sea el color correcto una vez
  estandaricemos §2.1.
- **Categorías con ícono dentro de círculo de color** (fuerza/cardio/movilidad/etc.) — mismo
  patrón que nuestro `.kpi-icon`, ya alineado.
- **Fotografía de atleta en alto contraste, con grano/dureza** — relevante sobre todo para
  cualquier superficie de marketing/landing (si algún día existe una fuera de la app), menos
  relevante para las pantallas de producto que son más data/dashboard.

Conclusión: nuestra base (dark mode, cards con glow sutil, KPI tiles, progress rings, nav con
acento activo) ya está alineada con el género visual. Lo que falta para que "se sienta" como
estas referencias no es rediseñar la estructura — es disciplinar la paleta a 1-2 acentos
protagonistas (§2.1) y subir el peso/impacto de los headlines heroicos (§2.2).

---

## 1. Voz y tono [DRAFT v2 — confirmaste la base, se agrega registro estoico/Dark Knight
y regla de vocabulario en dos capas. Sigue siendo draft hasta que veas copy real aplicado]

### 1.1 Base (ya confirmada por Alonso)

El manifesto no tiene una sección de voz/tono explícita, pero su lenguaje ya es una voz
consistente: se define tanto por negación como por afirmación ("Qué NO es" tan largo como
"Qué es"), rechaza el hype activamente, tiene autoridad calmada en vez de motivacional-genérica,
y todo es explicable (`focus_notes`/`justification` ya son la prueba en producto). Vocabulario
de sistemas/ingeniería, no de fitness-influencer. Esto se queda igual — es el piso.

### 1.2 Capa nueva: registro estoico / Dark Knight

Encima de esa base calmada, la marca puede tener momentos de intensidad — no ruido constante,
sino frases cortas y graves en los momentos que importan (inicio de bloque, un PR, cerrar
una semana difícil). El modelo mental: **el bat-signal, no una alarma de incendios** — aparece
poco, y cuando aparece, se nota.

Reglas concretas para ese registro:

- **Frases cortas, ganadas, no gritadas.** Nunca signos de exclamación en cascada, nunca
  mayúsculas para simular energía. La intensidad viene de la precisión de la frase, no del
  volumen tipográfico.
- **Se gana con evidencia, no se regala.** Una frase estoica solo aparece cuando el dato la
  respalda (bloque completado, adherencia real, PR real) — nunca como relleno motivacional
  de un día cualquiera. Esto conecta directo con el principio #5 del manifesto (todo es
  explicable): si vas a decir algo grave, tiene que estar justificado por el dato, igual que
  una recomendación de programación.
**Ejemplos por momento real de la app** (no es copy final — calibran el registro; algunos
parten de strings que ya existen en el código, marcados como "hoy"):

| Momento | Hoy (si ya existe) | Dirección estoica/Dark Knight |
|---|---|---|
| Cierre de bloque con buena adherencia | — (no existe todavía) | *"Bloque cerrado. La curva sigue subiendo."* |
| Instrucción genérica de "no te rindas" | — | *"La sesión de hoy no se negocia. Se ejecuta."* (evitar del todo — nunca frases motivacionales sin dato real detrás) |
| Nuevo PR / techo de carga | — | *"Nuevo techo. El sistema ya sabe qué sigue."* |
| Semana de baja adherencia / bloque difícil | — | *"Esta semana costó. El plan ya se ajustó a eso."* — nunca felicitar ni regañar, constatar y seguir |
| Frase del día en el dashboard (`QUOTES` en `page.tsx:32-40`) | *"Progreso sostenible, no entrenamientos heroicos."* ya está en el registro correcto — es evidencia de que el tono ya vive parcialmente en el código | Agregar en el mismo espíritu: *"Lo que no se mide, no se ajusta."* / *"El descanso de hoy es la fuerza de la próxima semana."* |
| Aviso de tendencia (`trendHint` en `page.tsx:97`, 3 sesiones con RPE 8+) | *"Llevas 3 sesiones seguidas con RPE alto (8+) — dinos cómo te sientes hoy."* — ya calmado, correcto | Versión más directa si se quiere más filo: *"3 sesiones seguidas al límite. El sistema quiere saber cómo llegaste hoy."* |
| Ejercicio saltado (sin culpa, sin celebrar excusas) | — | *"Se saltó. Queda registrado, no juzgado — el plan sigue con lo que sí pasó."* |
| Confirmación trivial (guardar peso) | *"Peso guardado ✓"* | Se queda igual — una confirmación de dato no necesita registro estoico, la intensidad se reserva para momentos que importan (regla de "se gana con evidencia") |

**Nota de idioma encontrada durante la revisión de código (no es de tono, es inconsistencia
de idioma):** el botón principal en `page.tsx:204` dice *"Start workout"* en inglés, mientras
el resto de la copy de esa misma pantalla está en español (*"Estadísticas"*, *"Guardar"*,
*"Generar sesión de hoy"*). Cuando se trabaje la copy real, esto debería unificarse a español
(ej. *"Empezar entrenamiento"* o, en el registro estoico, *"A entrenar"*).

### 1.3 Conciencia cuerpo-mente-emoción (mismo registro estoico, no uno nuevo)

Pediste que la marca tenga mucha conciencia corporal — escuchar al cuerpo, cuidado del
cuerpo, postura, y que cuerpo/mente/emoción estén integrados. Esto no es una capa aparte
del registro estoico de §1.2 — es la misma disciplina aplicada hacia adentro en vez de
hacia afuera. El estoicismo real (Marco Aurelio, Epicteto) nunca fue ignorar el cuerpo: era
prestarle atención precisa y responder con disciplina, ni suprimirlo ni sobre-reaccionar a
él. Esa es exactamente la diferencia que esta marca ya tiene con el "no pain no gain" (que
el manifesto rechaza explícitamente) y con el "escucha a tu cuerpo" genérico de wellness
(vago, sin dato, sin acción concreta detrás).

**El cuerpo es información, no un enemigo a vencer ni algo a ignorar.** Regla de tono:
cada vez que la marca menciona dolor, fatiga, sueño, energía o estado de ánimo, lo hace
como dato que produce una decisión concreta — nunca como validación emocional vacía
("¡tú puedes!") ni como alarma dramática. El patrón siempre es: **se nombra el estado del
cuerpo/mente → se conecta a lo que el sistema hace con esa información.** Esto ya existe
como mecánica de producto (check-in diario de energía/sueño/dolor en `page.tsx`, `RPE`,
`soreness_pain`, `focus_notes`) — lo que falta es que el *lenguaje* alrededor de esos
puntos lo refleje con la misma calma.

Esto también es el lugar natural para hablar de postura y control corporal cuando aparezca
(coherente con cómo el manifesto ya entiende la movilidad: "rango de movimiento utilizable
bajo control activo", no estiramiento pasivo) — la marca puede dar una instrucción de forma
y, en el mismo aliento, explicar qué le está diciendo el cuerpo si esa forma falla.

**Ejemplos:**

| Momento | Dirección (cuerpo como dato, no como drama) |
|---|---|
| Dolor reportado en el check-in | *"Rodilla anotada. El plan de hoy se ajusta a eso, no al calendario."* |
| Energía baja (1-2 en el picker) | *"Energía baja hoy. No es debilidad, es información — el plan de hoy pesa menos."* |
| Instrucción de forma (bisagra de cadera) | *"Dóblate desde la cadera, no desde la espalda baja. Si la espalda baja se queja, es la señal de que el patrón se perdió — para ahí, no empujes."* |
| Día de descanso / deload | *"Hoy no hay carga. El cuerpo también entrena cuando descansa."* |
| Patrón detectado en varias sesiones (Coach Synthesis) | *"Dolor reportado en press de banca en 2 de las últimas 3 sesiones. El patrón importa más que el evento aislado."* |
| Estado de ánimo bajo / contexto difícil declarado | *"Contexto anotado. Hoy el sistema entrena con lo que tienes, no con lo que tendrías en un día perfecto."* |

Esta conciencia corporal es también el argumento más fuerte contra que el tagline suene a
software (tu observación de la sesión pasada): "cuerpo" es concreto y físico, "sistema" es
abstracto — cada vez que haya que elegir entre las dos palabras en copy de marca, gana cuerpo.

### 1.4 Regla de vocabulario — término correcto + traducción a lenguaje llano

Confirmaste que el vocabulario técnico está bien, pero la app debe ser entendible por alguien
sin experiencia previa en entrenamiento. Regla: **nunca se reemplaza el término técnico
correcto — siempre se acompaña de su explicación en lenguaje que un niño de 10 años
entendería.** El término correcto siempre está presente (para que la persona lo aprenda y
pueda buscarlo/hablarlo con un entrenador real); la explicación llana va al lado, no en vez de.

Patrón de aplicación (término técnico primero, explicación entre paréntesis o en texto
secundario/muted inmediatamente después — mismo patrón que ya usa `focus_notes` para
explicar el porqué de una decisión):

| Término técnico (se queda igual) | Traducción a lenguaje llano (se agrega al lado) |
|---|---|
| RPE (Esfuerzo Percibido) | qué tan duro se sintió el ejercicio, en una escala del 1 al 10 |
| Hipertrofia | hacer crecer el músculo |
| Bisagra de cadera (hinge) | doblarte desde la cadera, no desde la espalda baja |
| Deload / semana de descarga | una semana donde entrenas más suave a propósito, para que el cuerpo recupere |
| Progresión de carga | ir subiendo el peso poco a poco, sesión tras sesión |
| Trabajo unilateral | ejercicios de un solo lado del cuerpo a la vez (una pierna, un brazo) |

Esto no es una lista cerrada — es el patrón a seguir cada vez que aparezca un término técnico
nuevo en copy, notificaciones, o `focus_notes`/`justification` generados por el coach.

---

## 2. Tokens

### 2.1 Color [CONFIRMADO Y APLICADO — 2026-07-04. Reduce la paleta cromática de 6 colores
a 4: 1 primario, 1 secundario, 2 semánticos. Ya migrado en el código real, no solo en doc]

**Base / superficie (sin cambios — esta parte ya funcionaba bien):**

| Token | Valor | Uso |
|---|---|---|
| `--background` | `#08090c` | fondo base de la app |
| `--background-elevated` | `#0c0d11` | inputs, energy-picker |
| `--surface` | `#101116` | cards (base del gradiente) |
| `--surface-2` | `#16171d` | cards (tope del gradiente), exercise-card |
| `--surface-3` | `#1c1e26` | botones default, tiles secundarios |
| `--border` | `rgba(255,255,255,.06)` | bordes sutiles |
| `--border-strong` | `rgba(255,255,255,.12)` | bordes de inputs/botones |
| `--foreground` | `#f5f5f7` | texto principal |
| `--muted` | `#8b8f9c` | texto secundario/labels |

**Por qué ámbar/dorado como primario, y no lima o rojo (las otras dos opciones obvias
dado tu moodboard):**

De tus 6 referencias, los acentos dominantes se reparten entre lima (2), rojo (1), naranja (1)
y ámbar (1) — no hay un ganador único, así que la decisión es de psicología de color aplicada
a *esta* marca, no de copiar la referencia más repetida.

- **Lima/verde neón** — es hoy el acento más común en apps de fitness (2 de tus 6 referencias
  ya lo usan, y es el look "GYM UI DESIGN genérico" de plantilla). Psicológicamente comunica
  energía/vitalidad, pero es el camino de menor distinción — y competiría directo con
  nuestro verde semántico (positivo), quitándole significado.
- **Rojo** — comunica urgencia/intensidad/adrenalina, coherente con "train hard". Pero en
  casi cualquier sistema de UI el rojo ya está reservado para error/peligro/negativo — usarlo
  como color de marca genera el conflicto semántico más caro de los tres (cada CTA se leería
  un poco como alarma).
- **Ámbar/dorado (recomendado)** — psicológicamente comunica **logro, maestría, disciplina
  que se gana**, no euforia instantánea. Encaja con la narrativa ya existente en el manifesto
  (progreso medido en bloques/meses, nunca en una sesión) y con el registro Dark Knight que
  pediste: el dorado del símbolo/cinturón cortando la oscuridad, presente solo cuando importa,
  no como fondo constante. Es también el acento menos "clonado" de tu moodboard (solo 1 de
  6 referencias lo usa como protagonista), lo cual ayuda a que la marca no se vea como
  una plantilla más de gym-app-2026.

**Acento primario (ámbar/dorado) — reemplaza al índigo como protagonista:**

| Token | Valor | Uso |
|---|---|---|
| `--accent-primary` | `#f5a623` (ya existía en la paleta vieja como "amber", se promueve) | CTA primario, focus ring, nav activo, relleno del progress ring |
| `--accent-primary-2` | `#ffc670` | hover de CTA, iconos de nav activo |
| `--accent-primary-glow` | `rgba(245,166,35,.35)` | sombra/glow de foco y CTA |

**Acento secundario (acero/grafito frío) — para estructura, no para llamar la atención:**

| Token | Valor | Uso |
|---|---|---|
| `--accent-secondary` | `#64748b` (slate) | links, íconos secundarios/inactivos, elementos de UI que no deben competir con el dorado |

Razón del secundario frío: el contraste cálido (dorado) / frío (acero) es "fuerza + disciplina"
sin decir una palabra — y es visualmente el par de color más asociado a la estética Dark Knight
(grises fríos, nada de neón). El índigo viejo (`#6366f1`) puede jubilarse — ya no tiene rol.

**Semántico — reducido a 2 colores, nada más (elimina teal, pink, blue decorativo):**

| Token | Valor | Significado — y solo esto, nunca decorativo |
|---|---|---|
| `--accent-positive` | `#22c55e` (mismo verde de antes) | delta positivo, meta cumplida, adherencia buena |
| `--accent-attention` | `#ef4444` | delta negativo, precaución, algo que requiere leer el porqué — fusiona lo que antes eran ámbar-advertencia + rosa-negativo en un solo color |

**Migración aplicada (2026-07-04, confirmada por Alonso)** — código real actualizado en
`globals.css`, `stats/page.tsx`, `CoachSynthesis.tsx`. Verificado visualmente en preview:
CTA/nav/progress-ring en dorado, íconos decorativos en acero, deltas en verde/rojo, sin
choques de color. Detalle de lo migrado:

- `--accent-teal`, `--accent-pink`, `--accent-blue` → eliminados de `:root`.
- Usos decorativos sueltos de ámbar (ícono "Síntesis del coach", ícono "Progresión de
  cargas", sparkline de cargas) → `--accent-secondary`.
- `--accent-blue` en badge default → `--accent-secondary`.
- Todo delta negativo/precaución (antes repartido entre ámbar y rosa) → `--accent-attention`.
- Glow de fondo del body y highlight de nav activo (antes índigo) → recalculados en dorado
  (`rgba(245,166,35,…)`); el segundo glow decorativo (antes teal) → acero muy sutil
  (`rgba(100,116,139,.05)`).

**Hallazgo durante la migración — paleta de categoría de sesión, no capturada en la
auditoría original:** `TYPE_COLORS` en `components/Collapsible.tsx` es un mapa hardcodeado
(no usa las variables CSS de arriba) para las etiquetas de tipo de sesión (Fuerza/Running/
Yoga/Benchmark). Dos de sus 4 colores chocaban directo con el sistema nuevo: `running` usaba
el mismo verde que ahora es `--accent-positive`, y `otro` usaba un ámbar casi idéntico al
nuevo `--accent-primary`. Se corrigió a una paleta de categoría deliberadamente separada de
la paleta de marca (`fuerza: #64748b` acero, `running: #38bdf8` celeste, `yoga: #a855f7`
morado, `otro: #2dd4bf` teal) — para que una etiqueta de "tipo de sesión" nunca se lea como
CTA de marca ni como juicio de valor positivo/negativo. Es la única categoría de color en
todo el sistema con más de 2 hues, y es intencional: son 4 tipos de sesión reales que hay
que distinguir de un vistazo, no una escala de estado.

### 2.2 Tipografía

De `layout.tsx:5-19` — tres familias vía `next/font/google`:

| Token | Familia | Uso |
|---|---|---|
| `--font-display` | Space Grotesk (500/600/700) | headings (`h1-h3`), wordmark, KPI values, hero greeting, títulos editables |
| `--font-sans` | Inter | cuerpo de texto, UI general |
| `--font-mono` | JetBrains Mono (500/600) | *definida pero sin uso visible encontrado en componentes actuales — confirmar si es para datos numéricos/logs* |

**Escala real (extraída de usos en `globals.css`):**

| Uso | Tamaño | Peso | Familia |
|---|---|---|---|
| `h1` | 1.7rem | 600 | display |
| Hero greeting | 1.5rem | 600 | display |
| Title edit (nombre editable) | 1.15rem | 600 | display |
| `h2` | 1.1rem | 600 | display |
| `h3` | 0.98rem | 600 | display |
| KPI value | 1.8rem | 600 | display |
| Body / botones | 0.9–0.94rem | 400/500 | sans |
| Chips / badges | 0.76rem | 600 | sans |
| Labels / captions | 0.76–0.83rem | 500 | sans |

Números tabulares (`font-variant-numeric: tabular-nums`) se usan consistentemente en KPIs y
chips — correcto para que las cifras no "salten" al actualizarse.

**[DRAFT] Heading de impacto** — propuesto en §0.1 a partir del moodboard. Un variante nuevo,
solo para momentos "hero" (saludo principal del dashboard, cierre de bloque, un PR) — no
reemplaza `h1`/`h2`/`h3` de sección. Dirección: mayúsculas, tracking más cerrado, peso 700
(ya disponible en Space Grotesk, hoy sin usar — el CSS solo carga 500/600/700 pero los
headings actuales tope en 600), tamaño mayor al `h1` actual (ej. 2.2–2.6rem). Se combina con
el registro estoico de §1.2 — este es el tamaño de letra que le corresponde a una frase como
"Bloque cerrado. La curva sigue subiendo."

### 2.3 Espaciado, radios, sombra, movimiento

| Categoría | Valores reales | Fuente |
|---|---|---|
| Radio grande | `18px` (`--radius`) | cards, KPI tiles |
| Radio chico | `12px` (`--radius-sm`) | botones, inputs, exercise-card |
| Radio pill | `999px` | badges |
| Radio chip | `7px` | chips |
| Padding componente | `4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 32px` — sin escala formalizada, valores ad-hoc | uso disperso en `globals.css` |
| Sombra card | `0 1px 2px rgba(0,0,0,.4), 0 12px 32px -16px rgba(0,0,0,.55)` | `--shadow-card` |
| Sombra elevada (hover) | `0 1px 2px rgba(0,0,0,.5), 0 24px 48px -20px rgba(0,0,0,.65)` | `--shadow-lift` |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out`) | todas las transiciones |
| Duración | `0.12s` (press/scale) – `0.24s` (blur/color) | consistente en todo el CSS |

**[DRAFT]** El padding no tiene una escala base-N formal (no es un múltiplo limpio de 4 u 8
en todos lados — hay `9px`, `14px`, `22px`). Si quieres, puedo proponer una escala de
espaciado formal (ej. base 4: 4/8/12/16/20/24/32) y migrar los valores sueltos, pero es
una decisión de código, no solo de documentación — avísame si lo hacemos.

---

## 3. Componentes

Inventario real de `app/src/components/` + clases de componente en `globals.css`.
Archivos: `AppNav.tsx`, `CoachSynthesis.tsx`, `Collapsible.tsx`, más patrones en `stats/page.tsx`.

### Card (`.card`)
Contenedor base: gradiente `surface-2 → surface`, borde 1px, `--radius`, `--shadow-card`,
más un borde interno de 1px con gradiente (`::before`) para efecto de highlight superior.
Variante `a.card` (clickeable): hover eleva (`translateY(-1px)`) y cambia a `--shadow-lift`,
borde pasa a dorado translúcido.

### KPI Tile (`.kpi-tile`, `.kpi-value`, `.kpi-label`, `.kpi-sub`)
Mismo tratamiento visual que Card. `kpi-icon` es un contenedor 34×34 con `border-radius: 10px`
para el ícono de categoría — hoy en `--accent-secondary` (acero) para íconos puramente
decorativos, o `--accent-positive`/`--accent-attention` cuando el KPI es un dato con juicio
de valor (ej. adherencia por debajo/arriba de meta). Grid responsivo
`auto-fit, minmax(150px, 1fr)`.

### Botón — default y `.btn-primary`
Default: `surface-3`, borde `border-strong`, radio chico. Estados: hover (`surface-2`),
active (`scale(0.97)`), disabled (`opacity: .4`). `.btn-primary` usa gradiente
`--accent-primary → --accent-primary-2` (dorado) + texto blanco + glow — es el único CTA
con peso visual fuerte, correcto para mantener jerarquía de una sola acción primaria por vista.

### Input / Textarea
Fondo `background-elevated` (más oscuro que las cards, para destacar como "hueco" de
entrada), focus con anillo de glow dorado (`box-shadow` con `--accent-primary-glow`) —
sin `outline` nativo, reemplazado correctamente por el anillo custom.

### Badge (`.badge` + `.badge-dot`)
**[Corregido 2026-07-05]** Ya no es una pill sólida del color de categoría — eso hacía que
la paleta de categoría de sesión (4 hues: `TYPE_COLORS` en `Collapsible.tsx`) se sintiera
como "demasiados colores" al verse junto al resto del sistema (hallazgo al visualizar el
design system completo en Claude Design). Ahora es una pill neutra (`--surface-3`, borde
`--border-strong`, texto `--foreground`) con un punto de 7px del color de categoría al
inicio — mismo patrón que usan Linear/Notion para tags. El color sigue diferenciando el
tipo de sesión, pero ya no compite visualmente con el acento de marca ni con el semántico.

### Chip (`.chip`)
Más sutil que badge — fondo blanco al 6% de opacidad, texto muted, para metadata secundaria
(reps, series). Usa `tabular-nums`.

### Hint Banner (`.hint-banner`)
Borde izquierdo de 3px + fondo al 8% de opacidad, en `--accent-attention` (rojo) — "esto
necesita tu atención", consistente con el semántico de §2.1.

### Energy Picker (`.energy-picker`)
Selector segmentado (RPE/energía del día, probablemente). Fondo `background-elevated`,
opción seleccionada pasa a fondo sólido + glow dorado (`--accent-primary`). Buen uso del
acento primario para marcar selección activa sin introducir un color nuevo.

### Collapsible (`Collapsible.tsx` + `.collapsible-trigger`, `.collapsible-body`)
Trigger de texto muted que se ilumina a `foreground` en hover — patrón "leer más" mencionado
en `PENDIENTES.md` (notas largas de ejercicio). Este mismo archivo también define `Badge` y
la paleta de categoría de sesión (`TYPE_COLORS`) — ver nota de migración en §2.1.

### Navegación — Sidebar / Bottom Nav (`AppNav.tsx`)
Desktop: sidebar fija 232px con blur de fondo (`backdrop-filter: blur(20px) saturate(140%)`).
Mobile (`≤768px`): sidebar se oculta, aparece bottom nav fija con el mismo tratamiento de
blur. Estado activo: gradiente dorado sutil de fondo + ícono en `--accent-primary-2`.
Buen ejemplo de "glass" consistente en ambos breakpoints.

### Hero Header / Progress Ring tiles
`hero-greeting` (saludo, display font) + `hero-quote` (muted). `progress-ring-tiles`:
grid de 3 columnas, cada una con valor en display font + label muted — mismo lenguaje
visual que KPI tiles pero en variante compacta de 3 columnas fijas. El relleno del anillo
de adherencia (`AdherenceRing` en `stats/page.tsx`) usa `--accent-primary` (dorado).

### Title Edit (`.title-edit`, `.title-edit-trigger`)
Patrón de texto-que-se-vuelve-input al hacer click — título editable inline (nombre de
programa/bloque, probablemente). Trigger hereda tipografía de heading para que no haya
salto visual al pasar de texto a input.

### Coach Synthesis (`CoachSynthesis.tsx`)
Componente específico de dominio (no genérico) — usa ícono `Lightbulb` en `--accent-secondary`
(acero), ya que "insight/síntesis" es informativo, no un juicio de valor positivo/negativo
ni el CTA de marca.

---

## 4. Accesibilidad — notas rápidas (no auditoría completa)

- Focus visible: sí, anillo de glow custom en inputs — confirmar que también existe en
  botones y links de nav (no until verificado con teclado).
- Contraste: `--muted` (`#8b8f9c`) sobre `--background` (`#08090c`) — parece suficiente a
  simple vista pero no lo medí con una herramienta de contraste todavía.
- `prefers-reduced-motion`: no encontré ningún media query que lo respete — todas las
  transiciones corren siempre. Candidato a agregar si se prioriza accesibilidad.

Esto no es una auditoría formal — si quieres una, se puede correr `/design-system audit`
o pedir una revisión de accesibilidad dedicada.

---

## 5. Abierto / próximos pasos

- **[TBD] Nombre + tagline** — sesión de naming pendiente.
- **[TBD] Logo/isotipo** — no existe; una vez haya nombre, se puede generar dirección de
  logo (herramientas de generación de imagen/motion disponibles si quieres explorar rutas
  visuales antes de contratar diseño, o directo con un diseñador). Con el primario dorado
  ya definido (§2.1), cualquier exploración de logo ya tiene una paleta de la cual partir.
- **Confirmar §1 (voz y tono v2 — estoico/Dark Knight + regla de vocabulario)** — validaste
  la dirección en esta sesión; falta verla aplicada en copy real de la app (notificaciones,
  `focus_notes`, pantallas de cierre de bloque) para confirmar que se siente bien en uso,
  no solo en ejemplos aislados.
- **[x] §2.1 confirmado y migrado en código** (2026-07-04) — `globals.css`, `stats/page.tsx`,
  `CoachSynthesis.tsx`, `Collapsible.tsx` (paleta de categoría de sesión). Verificado
  visualmente en preview.
- **Heading de impacto (§2.2)** — variante tipográfica para momentos "hero", derivada del
  moodboard; falta definir tamaño/peso exacto y en qué pantallas aplica primero.
- **Espaciado formal** — decidir si migramos los valores ad-hoc a una escala base-N (§2.3).
- **Modo claro** — confirmado que no es prioridad; queda fuera de v1 de este documento.
- **Fotografía/imagery de marca** — el moodboard usa fotografía de atleta en alto contraste;
  no aplica a las pantallas actuales de producto (son dashboard/data), pero queda como
  referencia si algún día hay landing/marketing fuera de la app.
