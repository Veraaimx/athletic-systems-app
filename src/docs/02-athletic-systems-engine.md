# Athletic Systems Engine

> Cómo piensa el sistema. Aquí vive la inteligencia principal de programación.

## Framework de entrenamiento

El motor combina periodización en bloques, sobrecarga progresiva controlada y gestión
activa de fatiga, priorizando siempre la recuperación como condición habilitante del
progreso, no como su consecuencia.

AST funciona como un sistema de ingeniería de rendimiento individualizado:

```
Atleta → Diagnóstico → Identidad Atlética → Sistema de Programación → Feedback semanal
```

Primero entiende a la persona; después programa. Nunca parte de una rutina fija para
forzar al atleta a encajar en ella.

## AST Performance Model

### Nivel 1: Athlete Profile

Base personal y contextual del sistema: edad, peso, experiencia, historial deportivo,
disponibilidad, equipo, objetivos de vida, lesiones, preferencias, aversiones y estilo
de vida. Este perfil no es decoración: todo bloque debe poder explicar cómo lo usó.

### Nivel 2: Athletic Assessment

Evaluación de capacidades, no solo de ejercicios sueltos:

- **Strength:** squat, deadlift/hinge, press, pull-up/row, carries.
- **Power:** broad jump, vertical jump, med ball throw, sprints cortos u otros tests
  seguros según el atleta.
- **Engine:** 5K, pace de Zone 2, respuesta de frecuencia cardiaca, intervalos.
- **Mobility:** tobillo, cadera, hombro, columna torácica.
- **Durability:** historial de lesiones, puntos de dolor, tolerancia articular, core.

Cuando faltan datos de assessment, el motor no inventa niveles: programa conservador,
usa variantes seguras y pide/recoge evidencia.

### Nivel 3: Athletic Identity

Cada atleta tiene una identidad de entrenamiento que traduce su vida y metas a una
arquitectura de programación. Ejemplos:

- **Outdoor Explorer:** preparación para aventura/deportes; fuerza, endurance,
  movilidad y resiliencia.
- **Tactical Hybrid:** capacidad general alta; strength endurance, carries, potencia,
  tolerancia al esfuerzo y durabilidad.
- **Hybrid Competitor:** evento específico (HYROX, carrera, etc.); engine, pacing,
  estaciones y strength endurance.
- **Strength Athlete:** máxima fuerza; técnica, compuestos, hipertrofia de soporte.
- **Longevity Athlete:** mantener capacidades a largo plazo; movilidad, fuerza y salud
  articular.

La identidad puede combinar arquetipos. Si el atleta está entre dos categorías, el
motor lo dice y programa la mezcla explícitamente en lugar de simplificarlo.

### Nivel 4: Programming Systems

La programación es modular. Cada sesión debe tener una intención primaria clara:

- **Strength System:** producción de fuerza; compuestos, unilaterales, isométricos,
  tempo, carries pesados.
- **Power System:** producir fuerza rápido; jumps, throws, sprints cortos, derivados
  olímpicos seguros.
- **Engine System:** capacidad energética; Zone 2, tempo/threshold, VO2, intervalos,
  trabajo aláctico según el atleta.
- **Athletic Conditioning System:** capacidad de trabajo transferible; strength
  endurance, metabolic capacity, power endurance y mixed modal.
- **Mobility/Durability System:** movilidad utilizable, control motor, rehab activa,
  preparación articular y estabilidad de core.

### Nivel 5: Weekly Feedback Loop

El sistema no entrega un plan y desaparece. Cada semana revisa:

- **Readiness:** sueño, energía, estrés, dolor/molestias.
- **Performance:** cargas usadas, reps, tiempos, RPE, PRs, notas por ejercicio.
- **Adjustment:** subir, mantener, simplificar o hacer deload según evidencia.

El feedback semanal cambia decisiones futuras, pero no borra la estructura del bloque
sin explicación.

## Principios científicos

### Structured Training
Todo entrenamiento pertenece a un bloque con un propósito definido (reentrada, carga,
intensificación, deload). Ninguna sesión es aleatoria.

### Periodization
La carga e intensidad varían de forma planificada a lo largo de 4 semanas, alternando
acumulación y disipación de fatiga, para permitir adaptación real.

### Progressive Overload
El incremento de carga, volumen o dificultad ocurre solo cuando hay evidencia
(RPE, técnica, recuperación) de que el atleta está listo. Nunca es automático por
calendario.

### Fatigue Management
La fatiga se monitorea activamente (RPE, readiness, sueño, dolor) y se usa para
decidir si una sesión se mantiene, se reduce o se modifica. El sueño insuficiente
se trata de forma **conservadora**: solo degrada la sesión planificada cuando la
falta de sueño es notoria/consistente (no ante una sola mala noche aislada o una
caída leve). Ante señales ambiguas o leves, se mantiene la sesión como estaba
planificada.

### Recovery First
Ante la duda entre añadir más estímulo o proteger la recuperación, el sistema elige
proteger la recuperación.

### Minimum Effective Dose
Se busca el mínimo volumen e intensidad necesarios para generar adaptación. Más
volumen no es el objetivo; la adaptación sí.

### Joint Capacity
Toda progresión de carga se evalúa también contra la capacidad articular disponible.
Dolor articular activa modificación de programación, no se ignora.

### Athletic Performance
La programación prioriza transferencia a capacidad atlética real (fuerza utilizable,
movilidad funcional, capacidad aeróbica) por encima de números aislados.

### Strength First, Not Strength Only
La fuerza es la base sobre la que se construyen otras capacidades, pero no anula
engine, potencia, movilidad ni durabilidad. En atletas strength-biased hybrid, el motor
protege la fuerza máxima/relativa y desarrolla conditioning más denso sin convertir el
programa en un WOD aleatorio.

### Movement Quality
La calidad del movimiento (rango, control, técnica) es un prerequisito para progresar
carga, no un detalle posterior.

## Flujo de decisión

```
Inputs
  - Datos del atleta (Athlete Profile)
  - Registros de entrenamientos previos (peso, reps, series, RPE, dolor, notas)
  - Readiness (sueño, energía, estrés, dolor articular)
  - Semana del bloque actual (1-4)
  - Resultados/feedback del bloque anterior
  - Identidad atlética vigente (ej. Outdoor Explorer, Tactical Hybrid, Strength Athlete)
  - Assessment disponible por capacidad (strength, power, engine, mobility, durability)
↓
Proceso de decisión
  1. Confirmar identidad atlética y meta vigente.
  2. Evaluar readiness del día vs. sesión planificada.
  3. Evaluar tendencia de fatiga acumulada (últimos 7-14 días).
  4. Evaluar señales de dolor articular o molestias.
  5. Evaluar progreso técnico y de carga en ejercicios clave.
  6. Determinar si la sesión planificada se mantiene, se ajusta (volumen/intensidad)
     o se sustituye un ejercicio.
  7. Si es fin de semana/bloque: evaluar si el siguiente microciclo debe progresar,
     mantenerse o hacer deload.
↓
Outputs
  - Sesión del día (ajustada o no), con justificación explícita.
  - Recomendaciones de cambio para el siguiente bloque (nunca aplicadas automáticamente).
  - Actualización de variables de seguimiento (cargas de referencia, banderas de dolor).
```

## Cómo el sistema modifica un programa

- Un ajuste de carga requiere al menos 2 sesiones de evidencia consistente (no una sola).
- Una señal de dolor articular reduce inmediatamente rango de carga o sustituye el
  ejercicio por una variante de menor estrés articular — sin esperar al fin de semana.
- Un RPE consistentemente bajo (sesión sentida "fácil") en semana de carga habilita
  incremento de peso/series en la siguiente sesión del mismo ejercicio.
- Un RPE consistentemente alto o señales de mala recuperación degradan la siguiente
  sesión planificada (menos volumen o intensidad) antes de cancelarla por completo.
- Cualquier cambio propuesto a nivel de bloque se presenta como recomendación con
  explicación; el atleta decide si se aplica.
