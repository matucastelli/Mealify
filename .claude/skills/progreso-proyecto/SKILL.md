---
name: progreso-proyecto
description: Retoma y registra el progreso del proyecto en docs/PROGRESO.md, para que el usuario pueda trabajar desde dos computadoras con la misma versión. Usala al empezar una sesión o cuando pregunte "¿por dónde íbamos?", "retomemos", "sigamos con lo de ayer"; después de cada commit, push o PR mergeado; y al cerrar ("listo por hoy", "me voy", "sigo en la otra compu", "cierro la sesión"). Usala también cuando pida anotar, registrar o documentar avances, decisiones o próximos pasos, aunque no nombre el archivo.
---

# Progreso del proyecto

El usuario trabaja este proyecto desde **dos computadoras**. Las conversaciones, la memoria y los planes de Claude se guardan solo en la compu donde se crearon; lo único que las dos comparten es **git**. Por eso `docs/PROGRESO.md`, commiteado y pusheado, es la fuente de verdad de "dónde estamos y qué sigue". Si el archivo no se actualiza o no se pushea, la otra compu arranca a ciegas.

Hay tres momentos de uso. Identificá en cuál estás por lo que pide el usuario.

## 1. Al empezar: retomar

1. **Sincronizar con GitHub antes de leer nada**, así lo que leés es la última versión:
   - `git fetch origin` y `git status -sb` para ver la rama actual y si está atrasada, adelantada o divergente.
   - **Atrasada**: `git pull --ff-only`. Si hay que cambiar de rama para seguir el trabajo registrado, hacelo (`git switch <rama>` y pull).
   - **Divergente**: no hagas pull ni merge. Explicá qué commits difieren y preguntá; en este repo ya pasó que se reescribió la historia de `main`, y un pull a ciegas vuelve a traer commits viejos.
   - **Cambios sin commitear**: avisá cuáles son antes de seguir; pueden ser trabajo a medias de esta compu.
2. **Leer `docs/PROGRESO.md`.** Si no existe, ofrecé crearlo reconstruyendo el estado con `git log`, las ramas y `CLAUDE.md`, usando la plantilla de abajo.
3. **Detectar lo que pasó desde la última entrada**: compará la fecha y el último commit que figuran en el archivo con `git log origin/main` y la rama de trabajo. Si se mergearon PRs o hay commits que el archivo no refleja, contalo y actualizá el archivo (momento 2).
4. **Chequear el entorno de esta compu**, que puede estar desactualizado aunque el código ya no lo esté:
   - Si no existe `node_modules`, o si `package-lock.json` cambió desde el último registro, hay que correr `npm install`.
   - Si falta `.env` (o lo que el proyecto necesite y no viaja por git), avisá qué hay que crear, sin mostrar valores secretos.
   - Si el archivo de progreso menciona otros pasos pendientes para esta compu, recordalos.
5. **Responder corto**: en qué estamos, cuál es el próximo paso concreto y si hay algo para resolver antes. No empieces a cambiar código en este momento; esperá que el usuario confirme.

## 2. Después de avanzar: registrar

Cuando se hace un commit, se pushea o el usuario avisa que mergeó un PR:

1. Actualizá `docs/PROGRESO.md`: el encabezado (fecha, rama, último commit), "Estado actual", "Próximo paso", los checkboxes del plan y una línea nueva en la bitácora.
2. Commiteá el archivo:
   - Si el trabajo todavía no está commiteado, incluí `docs/PROGRESO.md` en ese mismo commit.
   - Si ya está commiteado, hacé un commit aparte: `docs: actualizar progreso`.
3. Pusheá la rama actual y verificá con `git status -sb` que no quede nada adelantado.

## 3. Al cerrar: dejar todo listo para la otra compu

1. **Nada de trabajo solo en esta compu.** Si hay cambios sin commitear:
   - Mostralos y preguntá si se commitean como trabajo en curso (`wip: <qué es>`) en la rama actual. No los commitees sin avisar ni los descartes: son cambios del usuario.
   - Si el usuario no puede responder, dejalos sin commitear y anotá en "Pendientes para la otra compu" exactamente qué archivos quedaron sin subir y en qué compu.
2. Actualizá `docs/PROGRESO.md` como en el momento 2, con "Estado actual" pensado para quien retome sin contexto: qué quedó a medias y dónde.
3. En "Pendientes para la otra compu" dejá los pasos para arrancar allá, por ejemplo: `git fetch && git switch <rama> && git pull --ff-only`, `npm install` si cambiaron dependencias, reiniciar `npm run dev`.
4. Commit y push del archivo. Confirmá con `git status -sb`.
5. Cerrá con un resumen de 2 o 3 líneas: qué quedó subido, en qué rama y cuál es el primer paso en la otra compu.

## Formato de `docs/PROGRESO.md`

Usá esta estructura. Es para humanos también: español, frases cortas, sin pegar código.

```markdown
# Progreso de <proyecto>

> Última actualización: AAAA-MM-DD · Rama de trabajo: `<rama>` · Último commit: `<hash corto> <mensaje>`

## Estado actual
<2 a 4 líneas: qué está hecho, qué está a medio hacer y dónde>

## Próximo paso
<una acción concreta, por ejemplo "Commit 4 del plan: layout de tarjetas en celular">

## Plan en curso: <nombre del plan>
- [x] 1. <tarea> (PR #3)
- [ ] 3. <tarea> ← siguiente

## Decisiones
- AAAA-MM-DD: <decisión> — <por qué>

## Pendientes para la otra compu
- <paso o aviso; borralo cuando se resuelva>

## Bitácora
### AAAA-MM-DD
- <qué se hizo, con hash o número de PR>
```

- La bitácora va de la más nueva a la más vieja. Si el archivo pasa de unas 300 líneas, mové las entradas viejas a `docs/progreso-historial.md`.
- Fechas siempre absolutas (`2026-09-25`), nunca "ayer" u "hoy": el archivo se lee otro día y en otra compu.
- No repitas lo que ya dice `CLAUDE.md` (stack, estructura, reglas). Este archivo es sobre el **estado**, no sobre cómo es el proyecto.
- Nunca copies secretos (el contenido de `.env`, claves de API).
- Commits sin atribución a Claude: nada de `Co-Authored-By` ni "Generated with Claude Code".
