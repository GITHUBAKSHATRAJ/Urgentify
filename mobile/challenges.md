# Mobile Development Debugging Log: Beginner Challenges & Solutions

This document logs the common challenges faced when setting up and running the React Native / Expo mobile application on Windows, along with their solutions.

---

## Challenge 1: Android Emulator TCP Port 5554 Connection Refused (Error 10061)

### The Problem
When running `npm run android` (which calls `expo run:android`), the build fails during the emulator initialization step with the following error:
```text
› Opening emulator Medium_Phone_API_36.0
Error: could not connect to TCP port 5554: cannot connect to 127.0.0.1:5554: No connection could be made because the target machine actively refused it. (10061)
Error: C:\Users\Akshat Raj\AppData\Local\Android\Sdk/platform-tools/adb -s emulator-5554 emu avd name exited with non-zero code: 1
```

### Why it Happens
1. **Stale Emulator Processes**: The Android Virtual Device (AVD) or the Android Debug Bridge (`adb.exe`) daemon process got into a frozen or hung state in the background. It was still showing as an attached device but was refusing console/telnet commands.
2. **Snapshot Issues**: The emulator's quick-boot snapshot was corrupted, preventing it from initializing its control port correctly.

### The Solution
We killed the zombie processes and forced the emulator to boot fresh (cold boot):
1. **Kill all active processes** in PowerShell:
   ```powershell
   taskkill /F /IM emulator.exe /IM qemu-system-x86_64.exe /IM adb.exe
   ```
2. **Restart the ADB Server**:
   ```powershell
   adb kill-server
   adb start-server
   ```
3. **Launch with Cold Boot**: Launch the emulator directly bypassing the quick-boot snapshot:
   ```powershell
   & "C:\Users\Akshat Raj\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.0 -no-snapshot-load
   ```

---

## Challenge 2: Gradle Plugin Resolution Error / Mismatched Java Versions

### The Problem
When running the Android build, Gradle crashes immediately at the settings execution phase:
```text
* Where:
Settings file 'C:\Urgentify\mobile\android\settings.gradle' line: 16

* What went wrong:
Error resolving plugin [id: 'com.facebook.react.settings']
> 25.0.3
```

### Why it Happens
1. **Invalid JAVA_HOME**: The system's environment variable `JAVA_HOME` was pointing to an older, uninstalled Java SDK directory (`C:\Program Files\Microsoft\jdk-17.0.12.7-hotspot`).
2. **Incompatible Fallback**: Because the configured `JAVA_HOME` was invalid, Expo fell back to using an incompatible Java version (Java 25) present on the system `PATH`. React Native's Gradle plugins are not yet compatible with Java 25, causing compilation failure.

### The Solution
We updated `JAVA_HOME` to point to a valid, installed LTS Java version:
1. Locate the correct path of the installed Microsoft JDK (in this case, `C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot`).
2. Update the environment variable persistently for the current user:
   ```powershell
   [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot", "User")
   ```

---

## Challenge 3: Active Terminal Session Blocked by Cached Environment Variables

### The Problem
Even after updating `JAVA_HOME` in the user registry, running `npm run android` in the same terminal still fails with the same `com.facebook.react.settings` error.

### Why it Happens
Windows environment variables do not automatically propagate to already running command prompt or IDE sessions (like VS Code). The terminal keeps a cached copy of the old `JAVA_HOME` environment until the shell process is completely restarted.

### The Solution
We made the build process self-healing by configuring auto-recovery scripts and project settings:

#### Solution A: Self-Healing `gradlew.bat` (Recommended)
We edited the local `android/gradlew.bat` file to automatically check if `JAVA_HOME` is broken. If it is, the script attempts to re-route to the correct installed JDK or clears the variable to fall back to the system PATH.
Added to [gradlew.bat](file:///C:/Urgentify/mobile/android/gradlew.bat) (around line 33):
```batch
@rem Repair JAVA_HOME if it is invalid
if not exist "%JAVA_HOME%\bin\java.exe" (
    if exist "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot\bin\java.exe" (
        set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
    ) else (
        set "JAVA_HOME="
    )
)
```

#### Solution B: Dedicated Project JVM Configuration
We configured the Gradle daemon to use the correct JVM path project-wide, regardless of local environment variables.
Added to [gradle.properties](file:///C:/Urgentify/mobile/android/gradle.properties):
```properties
org.gradle.java.home=C:\\Program Files\\Microsoft\\jdk-17.0.18.8-hotspot
```
*(Note the double backslashes for escaping backslash characters in property files).*
