# Bienestoy

App personal para ver el **plan de la semana** (lunes a domingo) y si se cumplió. Una sesión planificada por día; en Hoy se marca hecha. El peso y las medidas van al lado, no mandan.

Sin cuenta ni nube. Los datos viven en este dispositivo.

**Usar:** [martamacfly.github.io/Bienestoy](https://martamacfly.github.io/Bienestoy/)

## Qué hace

- **Hoy** — si hay sesión, un check; si el día está vacío, sí o no de deporte.
- **Semana** — el plan (o el vacío); editar días y ejercicios; copiar la semana anterior.
- **Catálogo** — actividades y ejercicios.
- **Resumen** — cumplimiento, actividades y cuerpo.
- **Cuerpo** — pesaje y medidas.
- **Ajustes** — exportar e importar una copia JSON.

No es un programa de gym, ni un tracker de duración, ni una app de hábitos.

## Instalar en el teléfono

Ábrela en el navegador e instálala como app. Así se usa a pantalla completa y sigue funcionando sin red.

### iPhone o iPad (Safari)

1. Entra en [Bienestoy](https://martamacfly.github.io/Bienestoy/).
2. Pulsa el botón de compartir.
3. Elige **Añadir a pantalla de inicio**.

Chrome u otro navegador en iOS no instala igual de bien; usa Safari.

### Android (Chrome)

1. Entra en [Bienestoy](https://martamacfly.github.io/Bienestoy/).
2. En el menú, elige **Instalar aplicación** o **Añadir a pantalla de inicio**.

Usa siempre el mismo teléfono y el mismo navegador. Si borras datos del navegador o cambias de dispositivo, el historial se pierde salvo que hayas exportado una copia en Ajustes.

## Desarrollar

Hace falta Node.js.

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173/`. Tests: `npm test`.
