# Cómo compilar Ahorro Quest en Windows (paso a paso)

## 0. Preparación
1. Descomprime el ZIP en una ruta corta y sin acentos ni espacios, por ejemplo `C:\Proyectos\AhorroQuest`.
2. Usa JDK 17 para Gradle. No uses Java 22 o superior: Gradle 8.7 solo soporta Java 8 a 21.

## 1. Con Android Studio
1. *File > Open* y elige la carpeta `AhorroQuest` (la que contiene `settings.gradle.kts`).
2. *File > Settings > Build, Execution, Deployment > Build Tools > Gradle* y en **Gradle JDK** elige **jbr-17** (o el JDK 17 / Embedded JDK). Aplica.
3. Si aparece el aviso de JDK inválido, elige la opción con JDK 17.
4. Pulsa el icono de sincronizar. La primera vez descarga cosas y tarda varios minutos.
5. Acepta si ofrece instalar *Android SDK Platform 34* o *Build Tools*.
6. *Build > Build Bundle(s) / APK(s) > Build APK(s)*. El APK queda en `app\build\outputs\apk\debug\app-debug.apk`.

## 2. Solo con la terminal (si Android Studio da problemas)
Abre PowerShell en la carpeta del proyecto y ejecuta (ajusta las rutas si son distintas):

```
$env:JAVA_HOME="C:\Users\Auxit\.jdks\jbr-17.0.14"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat assembleDebug --stacktrace
```

Si Gradle pide el SDK, crea un archivo `local.properties` junto a `settings.gradle.kts` con esta línea:

```
sdk.dir=C\:\\Users\\Auxit\\AppData\\Local\\Android\\Sdk
```

## 3. Si falla
Copia el primer mensaje de error y las líneas que empiecen con `Caused by`.
