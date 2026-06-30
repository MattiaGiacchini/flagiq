# Bugfix Requirements Document

## Introduction

Este documento describe los requisitos para corregir cuatro problemas relacionados con la configuración de sesión en la aplicación FlagIQ:

1. **Progress bar restringido**: El GameProgressBar tiene un `max-width: 640px` que limita su ancho en pantallas más grandes
2. **Falta de persistencia**: La configuración de sesión (continentes, modo, contador, blitz) no se guarda entre recargas de página
3. **Estado inicial de "All Regions"**: El botón "All Regions" no se muestra como activo al iniciar la aplicación, aunque todos los continentes están seleccionados por defecto
4. **Toggle incompleto de "All Regions"**: El botón "All Regions" solo selecciona todos los continentes, pero no los deselecciona cuando ya están todos seleccionados

Estos bugs afectan la experiencia de usuario al configurar sesiones de juego, limitando la flexibilidad visual y requiriendo que los usuarios reconfiguren sus preferencias en cada visita.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN el GameProgressBar se renderiza en la vista de juego en una pantalla con ancho mayor a 640px THEN el elemento `.progress-bar-wrapper` tiene un `max-width: 640px` aplicado, lo que impide que la barra ocupe el 100% del ancho del contenedor padre disponible

1.2 WHEN el usuario configura los ajustes de sesión (continentes, modo, contador, blitz) y recarga la página THEN la configuración se pierde y vuelve a los valores por defecto

1.3 WHEN la aplicación se inicializa con DEFAULT_SESSION_CONFIG que incluye todos los continentes THEN el botón "All Regions" en ContinentFilter no se muestra como activo visualmente

1.4 WHEN el usuario hace clic en el botón "All Regions" y todos los continentes ya están seleccionados THEN el botón solo ejecuta `selectAll()` sin deseleccionarlos, no funcionando como un toggle

### Expected Behavior (Correct)

2.1 WHEN el GameProgressBar se renderiza en la vista de juego THEN el wrapper SHALL permitir que la barra ocupe el 100% del ancho disponible del contenedor padre

2.2 WHEN el usuario configura los ajustes de sesión (continentes, modo, contador, blitz) THEN la configuración SHALL guardarse en localStorage y SHALL restaurarse automáticamente al recargar la página

2.3 WHEN la aplicación se inicializa con DEFAULT_SESSION_CONFIG que incluye todos los continentes THEN el botón "All Regions" SHALL mostrarse visualmente como activo (con la clase `chip--all-active`)

2.4 WHEN el usuario hace clic en el botón "All Regions" y todos los continentes ya están seleccionados THEN el botón SHALL deseleccionar todos los continentes excepto uno (para mantener la validación de al menos 1 continente), funcionando como un toggle bidireccional

### Unchanged Behavior (Regression Prevention)

3.1 WHEN el GameProgressBar recibe las props `current`, `total`, y `streak` THEN el componente SHALL CONTINUE TO mostrar el progreso, el contador y la racha correctamente

3.2 WHEN el usuario cambia la configuración de sesión en SessionSetupPanel THEN los refs locales (selectedContinents, selectedMode, selectedCount, blitzEnabled) SHALL CONTINUE TO actualizarse reactivamente

3.3 WHEN el usuario hace clic en un continente individual en ContinentFilter THEN el botón SHALL CONTINUE TO toggle la selección de ese continente específico

3.4 WHEN el usuario hace clic en "All Regions" y no todos los continentes están seleccionados THEN el botón SHALL CONTINUE TO seleccionar todos los continentes

3.5 WHEN la configuración tiene menos de 5 continentes seleccionados THEN el botón "All Regions" SHALL CONTINUE TO no mostrarse como activo

3.6 WHEN el usuario inicia una sesión con configuración válida THEN sessionStore.updateConfig y startSession SHALL CONTINUE TO funcionar correctamente

3.7 WHEN el componente GameProgressBar renderiza el label de progreso y la barra de porcentaje THEN los estilos y transiciones SHALL CONTINUE TO aplicarse correctamente
