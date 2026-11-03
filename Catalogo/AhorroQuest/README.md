# Ahorro Quest

App Android minimalista, estilo juego, para aprender a ahorrar: registras ingresos y gastos, defines una meta y ves cómo crece tu barra de progreso, tu nivel y tu racha diaria.

## Funciones
- Ingresos y gastos con monto y nota; el saldo y la barra de la meta se actualizan al instante.
- Meta de ahorro editable (nombre y monto). El progreso es saldo / meta.
- Gamificación ligera: nivel (+1 cada 5 movimientos), racha de días seguidos con registros y reto diario («registra un movimiento hoy»).
- Mantén pulsado un movimiento para eliminarlo.
- Modo claro/oscuro automático (tema `Theme.Material3.DayNight`).
- Datos solo en el dispositivo (SharedPreferences, sin internet ni permisos).

## Estructura
```
app/src/main/java/com/ahorrojuego/app/
  Modelos.kt         Movimiento, Meta, Estado
  Repositorio.kt     guardado/lectura local (JSON en SharedPreferences)
  MainViewModel.kt   lógica: saldo, progreso, nivel, racha, reto (LiveData)
  MainActivity.kt    pantalla única y diálogos (ViewBinding)
app/src/main/res/layout/  activity_main, dialog_movimiento, dialog_meta
```

## Dependencias
AndroidX Core, AppCompat, Activity KTX, Lifecycle ViewModel/LiveData 2.7.0 y Material Components 1.11.0 (Material 3). Kotlin 1.9.24, AGP 8.5.2, Gradle 8.7, minSdk 24, compileSdk 34.

## Compilar
1. Abre la carpeta en Android Studio Flamingo o posterior (JDK 17 incluido) y espera la sincronización de Gradle.
2. Ejecuta en un emulador o teléfono con ▶ Run.
3. Para un APK: *Build > Build Bundle(s) / APK(s) > Build APK(s)*. Queda en `app/build/outputs/apk/debug/app-debug.apk`.
   Por línea de comandos: `./gradlew assembleDebug`.

Si Android Studio ofrece actualizar Gradle o AGP, puedes aceptar.

## Ideas siguientes
Varias metas, categorías de gasto, gráfico semanal de hábitos, recordatorio diario, migrar a Room.
