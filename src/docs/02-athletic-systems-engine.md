# Athletic Systems Engine

> Cómo piensa el sistema. Aquí vive la inteligencia principal de programación.

## Framework de entrenamiento

El motor combina periodización en bloques, sobrecarga progresiva controlada y gestión
activa de fatiga, priorizando siempre la recuperación como condición habilitante del
progreso, no como su consecuencia.

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
↓
Proceso de decisión
  1. Evaluar readiness del día vs. sesión planificada.
  2. Evaluar tendencia de fatiga acumulada (últimos 7-14 días).
  3. Evaluar señales de dolor articular o molestias.
  4. Evaluar progreso técnico y de carga en ejercicios clave.
  5. Determinar si la sesión planificada se mantiene, se ajusta (volumen/intensidad)
     o se sustituye un ejercicio.
  6. Si es fin de semana/bloque: evaluar si el siguiente microciclo debe progresar,
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
