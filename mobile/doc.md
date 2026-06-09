# React Native & Flutter – FAQs, Commands & Architecture Reference

> A structured reference covering build pipelines, runtime architecture, native bridges, CLI commands, cross-platform comparison, and interview-ready answers.

---

## Table of Contents

1. [Build & Compilation](#1-build-compilation)
2. [Runtime Execution](#2-runtime-execution)
3. [React Native Architecture – Deep Dive](#3-react-native-architecture-deep-dive)
4. [Flutter Architecture – Deep Dive](#4-flutter-architecture-deep-dive)
5. [Native Bridges & Custom Modules](#5-native-bridges-custom-modules)
6. [React Native – CLI Commands](#6-react-native-cli-commands)
7. [Flutter – CLI Commands](#7-flutter-cli-commands)
8. [Java Version & Gradle — Build Environment Fix (React Native)](#8-java-version-gradle-build-environment-fix-react-native)
9. [Common Build & Compilation Errors](#9-common-build-compilation-errors)
10. [Cross-Platform: React Native vs Flutter](#10-cross-platform-react-native-vs-flutter)
11. [Limitations](#11-limitations)
12. [Error Handling & Debugging](#12-error-handling-debugging)
13. [State Management](#13-state-management)
14. [Hot Reload vs Fast Refresh vs Hot Restart](#14-hot-reload-vs-fast-refresh-vs-hot-restart)
15. [Navigation](#15-navigation)
16. [Performance Optimization](#16-performance-optimization)
17. [Animations](#17-animations)
18. [Testing](#18-testing)
19. [OTA Updates & CodePush](#19-ota-updates-codepush)
20. [Security & Storage](#20-security-storage)
21. [Debugging Tools](#21-debugging-tools)
22. [CI/CD & Release Automation](#22-cicd-release-automation)
23. [Interview Questions & Answers](#23-interview-questions-answers)

---

## 1. Build & Compilation

### Q: Does React Native need a JavaScript and C++ compiler to convert code to Android?

Yes, but you never manage these compilers manually — the framework handles everything behind the scenes.

**JavaScript (Hermes Engine):**
- Your JS/TS code is bundled by **Metro Bundler** into a single `index.android.bundle` file.
- In a production build, the **Hermes compiler** converts this bundle **Ahead-of-Time (AOT)** into optimized bytecode (`.hbc` file), resulting in faster app startup.

**C++ (Android NDK):**
- React Native's core architecture (JSI, Fabric, Turbo Modules) is written in C++.
- When Gradle builds the app, it invokes the **Android NDK + CMake**, which compiles the C++ engine into shared native libraries (`.so` files) bundled inside your APK/AAB.

**Build sequence summary:**

```
[ JS / TS Code ]        → Hermes Compiler  → Bytecode (.hbc)
[ React Native Core ]   → NDK / CMake      → C++ Libraries (.so)  ──→ APK / AAB
[ Android Java/Kotlin ] → Gradle           → Dex / JVM Bytecode
```

---

### Q: Does the C++ engine convert JavaScript bytecode into native Android code?

No. C++ (Hermes) never converts your bytecode into Java or ARM machine code. Instead, it acts as a **permanent middleman** that:

1. Reads the pre-compiled `.hbc` bytecode file.
2. Executes logic (math, memory, variables) entirely within its own memory space.
3. Calls native Android UI components via the **JSI (JavaScript Interface)** when UI rendering is required.

**Analogy:** Think of it as a theatre production:
- The bytecode = the script written in shorthand.
- The C++ engine (Hermes) = the director who reads the script.
- Android (Java/Kotlin) = the actor who performs on stage.

The director never becomes an actor — they just give instructions.

---

### Q: When does Hermes convert JavaScript to bytecode — before or during runtime?

**Before runtime**, on the developer's machine during the build process:

- **Build time:** Hermes compiles `App.js` → `index.android.bundle` (`.hbc`), which is packed into the APK.
- **Runtime:** Hermes simply reads the pre-packaged bytecode and executes it — zero compilation happens on the user's phone.

This is the AOT advantage: users skip the cold-start compilation delay entirely.

---

## 2. Runtime Execution

### Q: What happens when a user opens a React Native app?

1. The Android OS boots up the native shell of the app.
2. The **Hermes C++ engine** starts and loads the pre-compiled `.hbc` bytecode file.
3. Hermes reads instructions line-by-line and executes logic in its own memory.
4. When a UI element is needed (e.g., a button), Hermes calls a native C++ function via **JSI**, which triggers the **Android OS UI framework** (Java/Kotlin) to draw the real native component.

---

### Q: What happens when JavaScript says "Show a Button"?

```
JS Bytecode: "Show a Button"
       ↓
Hermes C++ Engine (reads instruction)
       ↓
JSI → calls Android OS UI Framework
       ↓
Android draws a real native android.widget.Button on screen
```

Android draws the actual native component — Flutter's approach differs entirely (see Section 4).

---

## 3. React Native Architecture – Deep Dive

### The Old Architecture (pre-2022)

```
┌─────────────────────────────────────────────────────────┐
│                    JS THREAD                            │
│   Your App Code → Metro Bundle → Hermes Engine         │
└─────────────────────┬───────────────────────────────────┘
                      │  Async JSON Bridge
                      │  (serialized messages, single queue)
                      │  ← BOTTLENECK
┌─────────────────────▼───────────────────────────────────┐
│                  NATIVE THREAD                          │
│   UIManager → Android ViewGroup / iOS UIView           │
└─────────────────────────────────────────────────────────┘
```

**Problems with the Old Bridge:**
- All JS↔Native communication was **asynchronous** and serialized to JSON.
- All Native Modules were **eagerly loaded** at startup (slow cold start).
- Animations could stutter because UI updates had to cross the async bridge.
- No type safety — mismatched data types caused runtime crashes.

---

### The New Architecture (2022–present)

```
┌──────────────────────────────────────────────────────────┐
│                    JS THREAD                             │
│   Your App Code (TypeScript/JS)                         │
│   ↓                                                      │
│   Hermes Engine (bytecode execution)                    │
└──────────────────┬───────────────────────────────────────┘
                   │
          JSI (C++ Direct Call — synchronous, no JSON)
                   │
┌──────────────────▼───────────────────────────────────────┐
│               C++ LAYER (JSI Host Objects)               │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │   Turbo Modules     │  │   Fabric Renderer        │  │
│  │ (lazy-loaded native │  │ (concurrent UI, shadows  │  │
│  │  feature bridges)   │  │  in C++, priority queue) │  │
│  └──────────┬──────────┘  └────────────┬─────────────┘  │
└─────────────┼───────────────────────────┼────────────────┘
              │                           │
    ┌─────────▼──────────┐    ┌───────────▼────────────┐
    │  Kotlin / Java     │    │  Android View System   │
    │  (device APIs)     │    │  (real native widgets) │
    └────────────────────┘    └────────────────────────┘
```

**Key Components of the New Architecture:**

| Component | Role |
|---|---|
| **Hermes** | JS engine — reads and executes bytecode at runtime |
| **JSI** | C++ interface — allows JS to call native directly without JSON serialization |
| **Turbo Modules** | Lazily-loaded native modules — loaded on first call, not at startup |
| **Fabric** | New concurrent rendering engine — replaces UIManager |
| **Codegen** | Build-time tool — reads TypeScript specs and generates C++ bridge code automatically |
| **Metro Bundler** | Dev server + bundler — bundles all JS files into one, serves Hot Reload |

---

### How JSI works internally

In the Old Architecture, to call a native function from JS:
```
JS calls NativeModules.Camera.takePicture()
       ↓
Serialized to JSON string: '{"module":"Camera","method":"takePicture","args":[]}'
       ↓ (async, put in a queue)
Native thread receives JSON, deserializes it, finds the method, calls it
       ↓ (async callback back through the queue)
Result serialized to JSON, posted back to JS thread
```

With JSI:
```
JS holds a direct C++ reference to the Camera host object
       ↓ (synchronous)
JS calls camera.takePicture() — this is a direct C++ function call
       ↓
C++ calls Kotlin/Swift natively
       ↓
Result returned synchronously (or via Promise if async work needed)
```

---

### What is the Shadow Tree / Shadow Thread?

Before Fabric, React Native maintained a **Shadow Thread** — a separate thread that calculated layout (using Facebook's Yoga layout engine in C++) before passing results to the native UI thread.

```
JS Thread → Shadow Thread (Yoga layout in C++) → UI Thread (draw widgets)
```

With **Fabric**, the shadow tree is now managed in C++ and shared directly with the JS thread via JSI. This removes one async hop and enables **synchronous layout measurement** — critical for scroll performance and animations.

---

### What is Yoga?

**Yoga** is a cross-platform C++ layout engine built by Meta that implements **Flexbox** for mobile. When you write:

```jsx
<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
```

Yoga reads those flexbox rules and calculates the exact pixel positions for every element, on every screen size, identically on Android and iOS. It is embedded inside the React Native C++ core.

---

## 4. Flutter Architecture – Deep Dive

### Flutter Runtime Flow

```
┌──────────────────────────────────────────────────────────┐
│               YOUR DART CODE                            │
│   (Compiled AOT to native ARM machine code)             │
└──────────────────────┬───────────────────────────────────┘
                       │ Direct CPU execution (no VM at runtime)
┌──────────────────────▼───────────────────────────────────┐
│              FLUTTER ENGINE (C++)                        │
│  ┌──────────────┐  ┌───────────┐  ┌───────────────────┐ │
│  │  Dart VM     │  │ Skia /    │  │  Platform         │ │
│  │  (dev mode   │  │ Impeller  │  │  Channels         │ │
│  │  only)       │  │ Renderer  │  │  (native access)  │ │
│  └──────────────┘  └─────┬─────┘  └────────┬──────────┘ │
└────────────────────────── │ ────────────────│────────────┘
                            │                 │
                    ┌───────▼──────┐  ┌───────▼────────┐
                    │     GPU      │  │ Android / iOS  │
                    │  (Vulkan /   │  │ (only for OS   │
                    │   OpenGL)    │  │  services like │
                    │              │  │  camera, GPS)  │
                    └──────────────┘  └────────────────┘
```

**Key insight:** Flutter never asks Android/iOS to draw UI widgets. It talks to the GPU directly using Impeller (or Skia on older versions) and draws every single pixel of every button, text, and animation itself.

---

### Flutter Layer Architecture

```
┌──────────────────────────────────────────┐
│           Your App (Dart)                │  ← You write here
├──────────────────────────────────────────┤
│         Widgets Layer                    │  ← Stateless / Stateful widgets
├──────────────────────────────────────────┤
│         Rendering Layer                  │  ← RenderObject tree, layout
├──────────────────────────────────────────┤
│         Painting Layer                   │  ← Canvas, draw calls
├──────────────────────────────────────────┤
│         Dart:UI (dart:ui)                │  ← Thin Dart wrapper over C++
├──────────────────────────────────────────┤
│         Flutter Engine (C++)             │  ← Impeller / Skia, GPU, text
├──────────────────────────────────────────┤
│         Platform Embedder                │  ← Android, iOS, Web, Desktop
└──────────────────────────────────────────┘
```

---

### Skia vs Impeller

| | Skia | Impeller |
|---|---|---|
| **What** | Old GPU renderer (Google's 2D graphics library) | New Flutter renderer (built by Flutter team) |
| **Problem with Skia** | Compiled shaders at runtime → caused "jank" (stutter) on first render | |
| **Impeller's fix** | Pre-compiles all shaders at build time → zero jank on first frame | |
| **Status** | Default on Flutter < 3.10 | Default on iOS since Flutter 3.10, Android since 3.16 |

---

### Flutter Widget Tree vs Element Tree vs Render Tree

Flutter actually maintains **three parallel trees** at runtime:

```
Widget Tree (immutable blueprint)
    ↕ Flutter reconciles diffs
Element Tree (stateful, long-lived — like React's Virtual DOM)
    ↕ delegates to
Render Tree (RenderObjects — actual layout + paint logic)
    ↕ paints to
GPU (via Impeller/Skia)
```

- **Widget:** Immutable description of UI (like a blueprint). Rebuilt on every `setState()`.
- **Element:** The live instance that persists. Flutter diffs the widget tree and updates only changed elements (like React's reconciliation).
- **RenderObject:** Does actual layout measurement and GPU paint calls. Only updated when layout actually changes.

---

### Flutter vs React Native — Runtime Comparison

| Step | React Native | Flutter |
|---|---|---|
| **Code Language** | JavaScript / TypeScript | Dart |
| **Compilation** | JS → Hermes bytecode (AOT) | Dart → Native ARM machine code (AOT) |
| **App Boot** | OS boots Hermes C++ engine, engine reads bytecode | OS executes ARM binary directly on CPU |
| **Logic Execution** | Hermes interprets bytecode at runtime | CPU runs native machine instructions directly |
| **UI Rendering** | JSI → tells Android/iOS OS to draw native widgets | Flutter engine draws every pixel on GPU canvas |
| **Native Features** | Turbo Modules via JSI | Platform Channels or Pigeon/JNIgen |
| **Layout Engine** | Yoga (Flexbox in C++) | Flutter's own Dart layout engine |

---

## 5. Native Bridges & Custom Modules

### Q: What happens if your JavaScript calls a feature with no Android native implementation?

There are three distinct scenarios:

**Scenario 1 – Pure Logic (No UI needed)**
Pure JS operations (sorting arrays, string parsing, math) are executed entirely by Hermes. Android never needs to be involved. These work perfectly.

**Scenario 2 – HTML/Web elements (Breaks)**
Trying to render `<div>` or calling `document.getElementById()` will crash. Android has no native concept of HTML tags. You must use React Native components like `<View>` and `<Text>` instead.

**Scenario 3 – Missing Device Feature (Requires Custom Bridge)**
If you call `CustomSensor.readData()` without a registered native bridge, Hermes will look in its internal C++ registry, find nothing, and throw:
> `Uncaught TypeError: Cannot read property 'readData' of undefined`

The fix is to create a **Turbo Module** (custom native bridge).

---

### Q: How does a developer create a custom native bridge in React Native?

Modern React Native uses **Turbo Modules** with **Codegen** (no raw C++ required):

**Step 1 – TypeScript Specification (the blueprint)**
```typescript
import {TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  readData(): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CustomSensor');
```

**Step 2 – Codegen generates the C++ bridge automatically**
Running the build command triggers Codegen, which scans your spec file and generates `.h` and `.cpp` bridge files — no manual C++ writing needed.

**Step 3 – Write the native Android implementation (Kotlin)**
```kotlin
class CustomSensorModule(reactContext: ReactApplicationContext)
    : NativeCustomSensorSpec(reactContext) {

    override fun getName() = "CustomSensor"

    override fun readData(promise: Promise) {
        try {
            promise.resolve("Data from hardware sensor")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
```

**Step 4 – Register the module** via a `ReactPackage` class so it's available on app boot.

**Runtime flow after bridging:**
```
JS: CustomSensor.readData()
       ↓
Hermes finds C++ bridge (registered via Codegen)
       ↓
C++ layer forwards call to Kotlin readData()
       ↓
Kotlin reads hardware → returns result back to JS Promise
```

---

### Q: Where do you write the Kotlin native module code inside a React Native project?

**Method 1 – Dedicated Turbo Module folder (Recommended):**
```
my-react-native-app/
└── modules/
    └── RTNCustomSensor/
        ├── js/
        │   └── NativeCustomSensor.ts        ← TypeScript spec
        └── android/
            └── src/main/java/com/customsensor/
                └── CustomSensorModule.kt    ← Write Kotlin here
```

**Method 2 – Inside the main Android project (Quick prototype):**
```
my-react-native-app/
└── android/
    └── app/src/main/java/com/yourcompany/myapp/
        └── CustomSensorModule.kt            ← Write Kotlin here
```

Use Method 1 for New Architecture projects; Method 2 for quick legacy prototypes.

---

### Q: Can Codegen also create a custom bridge between React Native and Swift (iOS)?

Yes — Codegen works identically for iOS. You write the same TypeScript spec, Codegen generates the C++ bridge, and on the iOS side you write your logic in **Swift or Objective-C**.

```
[JS Code] → [Auto-generated C++ Bridge (Codegen)] → [Swift / Objective-C]
```

---

### Q: Can Codegen implement a brand-new Android feature immediately without waiting for the community?

Yes — this is precisely why Codegen and Turbo Modules exist.

1. Read Google's new Android API documentation.
2. Write a TypeScript spec defining inputs and outputs.
3. Run the build — Codegen auto-generates the C++ bridge.
4. Write a few lines of Kotlin calling the new Google API.

You are not blocked by npm package release cycles. You get direct, instant access to 100% of the Android OS the moment Google ships it.

---

### Flutter Platform Channels — the equivalent of React Native's Native Bridge

When Flutter needs to access native device APIs, it uses **Platform Channels**:

```
Dart Code
    ↓
MethodChannel('com.myapp/sensor')
    ↓  (via binary messenger — similar to old RN bridge but typed)
Kotlin / Swift
    ↓
Android/iOS OS API
    ↓ (result back up the same channel)
Dart
```

```dart
// Dart side
const platform = MethodChannel('com.myapp/battery');
final int level = await platform.invokeMethod('getBatteryLevel');
```

```kotlin
// Kotlin side (MainActivity.kt)
MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.myapp/battery")
    .setMethodCallHandler { call, result ->
        if (call.method == "getBatteryLevel") {
            result.success(getBatteryLevel())
        }
    }
```

**Pigeon** (code generator) eliminates the manual string-matching above by generating type-safe channel code from a Dart spec — the Flutter equivalent of React Native's Codegen.

---

## 6. React Native – CLI Commands

### Project Setup

```bash
# Install React Native CLI globally
npm install -g react-native-cli

# Create a new project (React Native CLI)
npx @react-native-community/cli init MyApp

# Create a new project (Expo — recommended for beginners)
npx create-expo-app MyApp
npx create-expo-app MyApp --template blank-typescript   # TypeScript template
```

---

### Running the App

```bash
# Run on Android emulator or connected device
npx react-native run-android

# Run on iOS simulator (macOS only)
npx react-native run-ios

# Run on a specific Android device (list devices first)
adb devices
npx react-native run-android --deviceId emulator-5554

# Run on a specific iOS simulator
npx react-native run-ios --simulator "iPhone 15 Pro"

# Start Metro bundler separately (useful for debugging)
npx react-native start
npx react-native start --reset-cache    # clears Metro cache
```

---

### Building for Production

```bash
# ─── ANDROID ───────────────────────────────────────────────

# Build a release APK (installs directly on device)
cd android && ./gradlew assembleRelease

# Build a release AAB (required for Google Play Store upload)
cd android && ./gradlew bundleRelease

# Output locations:
# APK  → android/app/build/outputs/apk/release/app-release.apk
# AAB  → android/app/build/outputs/bundle/release/app-release.aab

# ─── iOS ────────────────────────────────────────────────────

# Build release IPA (macOS + Xcode required)
npx react-native run-ios --configuration Release

# Or open Xcode and archive from Product → Archive
```

---

### Expo-specific Commands

```bash
# Start Expo dev server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Build in the cloud (EAS Build — no local Android Studio needed)
eas build --platform android
eas build --platform ios
eas build --platform all

# Build a local APK
eas build --platform android --profile preview --local

# Submit to app store
eas submit --platform android
eas submit --platform ios
```

---

### Useful Dev & Debug Commands

```bash
# Install dependencies
npm install
# or
yarn install

# Link native dependencies (React Native < 0.60, auto-linked after)
npx react-native link

# Clean Android build cache
cd android && ./gradlew clean

# Clean iOS build (macOS)
cd ios && xcodebuild clean

# Run TypeScript type check
npx tsc --noEmit

# Run tests
npx jest

# Upgrade React Native version
npx react-native upgrade

# Check environment setup
npx react-native doctor
```

---

### Generating a Signed APK (Step-by-Step)

```bash
# Step 1: Generate a keystore (do this once)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000

# Step 2: Place keystore in android/app/

# Step 3: Add to android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=yourpassword
MYAPP_UPLOAD_KEY_PASSWORD=yourpassword

# Step 4: Build the signed APK
cd android && ./gradlew assembleRelease
```

---

## 7. Flutter – CLI Commands

### Project Setup

```bash
# Check Flutter installation and environment
flutter doctor
flutter doctor -v                        # verbose output

# Create a new project
flutter create my_app
flutter create --org com.mycompany my_app           # with package name
flutter create --platforms android,ios my_app       # specific platforms
flutter create --template app my_app                # standard app template

# Add a package/dependency
flutter pub add http
flutter pub add provider

# Install all dependencies from pubspec.yaml
flutter pub get

# Upgrade all packages
flutter pub upgrade
```

---

### Running the App

```bash
# List connected devices and emulators
flutter devices

# Run on the first available device
flutter run

# Run on a specific device
flutter run -d emulator-5554              # Android emulator
flutter run -d "iPhone 15 Pro"           # iOS simulator (macOS)
flutter run -d chrome                    # Web browser

# Run in release mode (no debug overhead)
flutter run --release

# Run in profile mode (performance profiling)
flutter run --profile

# Run with verbose logging
flutter run -v
```

---

### Building for Production

```bash
# ─── ANDROID ───────────────────────────────────────────────

# Build a release APK
flutter build apk
flutter build apk --release              # explicit release mode
flutter build apk --split-per-abi       # separate APKs per CPU arch (smaller size)

# Build a release AAB (required for Google Play Store)
flutter build appbundle
flutter build appbundle --release

# Output locations:
# APK  → build/app/outputs/flutter-apk/app-release.apk
# AAB  → build/app/outputs/bundle/release/app-release.aab

# ─── iOS ────────────────────────────────────────────────────

# Build iOS release (macOS + Xcode required)
flutter build ios
flutter build ios --release

# Build an IPA for distribution
flutter build ipa

# ─── WEB ────────────────────────────────────────────────────

flutter build web
flutter build web --release

# ─── DESKTOP ────────────────────────────────────────────────

flutter build macos
flutter build windows
flutter build linux
```

---

### Useful Dev & Debug Commands

```bash
# Hot reload (press 'r' in terminal while flutter run is active)
# Hot restart (press 'R' in terminal)
# Quit (press 'q')

# Analyze code for errors and warnings
flutter analyze

# Run tests
flutter test
flutter test test/widget_test.dart       # specific test file
flutter test --coverage                  # with coverage report

# Format code
dart format .
dart format lib/main.dart

# Clean build cache
flutter clean

# Run pub cache repair
flutter pub cache repair

# Upgrade Flutter SDK itself
flutter upgrade

# Switch Flutter channel (stable / beta / master)
flutter channel stable
flutter channel beta
flutter upgrade

# Generate code (for packages like json_serializable, freezed)
dart run build_runner build
dart run build_runner watch              # watch mode — regenerates on file change
dart run build_runner build --delete-conflicting-outputs

# Inspect app size
flutter build apk --analyze-size
flutter build appbundle --analyze-size
```

---

### Generating a Signed APK in Flutter

```bash
# Step 1: Generate keystore (do this once)
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload

# Step 2: Create android/key.properties
storePassword=yourpassword
keyPassword=yourpassword
keyAlias=upload
storeFile=/Users/you/upload-keystore.jks

# Step 3: Reference key.properties in android/app/build.gradle
# (Add signingConfigs block — see Flutter docs)

# Step 4: Build signed AAB
flutter build appbundle
```

---

## 8. Java Version & Gradle — Build Environment Fix (React Native)

> **The #1 cause of React Native Android build failures is a Java version mismatch.** Gradle requires a specific supported JDK version. If your system defaults to the wrong one, the build crashes before a single line of your app code is even touched.

---

### Why Java Version Matters

Android's build tool **Gradle** is written in Java and must be compiled and run by a JDK. Each Gradle version only supports specific JDK versions:

| Gradle Version | Supported JDK |
|---|---|
| Gradle 7.x | JDK 11 |
| Gradle 8.x | JDK 17 or JDK 21 |
| Gradle 8.8+ | JDK 21 (recommended) |

If your system has JDK 8 set as the global default but your project uses Gradle 8, the build will immediately fail with an error like:
```
> Unsupported class file major version 65
```
or:
```
> Could not determine java version from '21.0.x'
```

---

### The Fix: Force a Specific Java Version Per Build

Instead of changing your global Java installation, you can **temporarily override** the Java version for just that terminal session using `JAVA_HOME`.

**Windows (Command Prompt):**
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.10 && cd android && gradlew clean && cd .. && npm run android
```

**Windows (PowerShell):**
```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"; cd android; .\gradlew clean; cd ..; npm run android
```

**macOS / Linux:**
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home && cd android && ./gradlew clean && cd .. && npm run android
```

---

### What Each Part Does — Behind the Scenes

#### Part 1: `set JAVA_HOME` / `$env:JAVA_HOME` / `export JAVA_HOME`

```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
```

- Creates a **temporary signpost in your terminal's memory** — valid only for this terminal window session.
- Tells Gradle: "When you need Java, look inside this specific JDK 21 folder."
- Does **not** permanently change your system's Java version.
- To make it permanent, set `JAVA_HOME` in your system's environment variables (Windows) or `~/.zshrc` / `~/.bashrc` (macOS/Linux).

#### Part 2: `&&` vs `;` — the chain operator

| Operator | Shell | Behaviour |
|---|---|---|
| `&&` | CMD / Bash | Run next command **only if the previous one succeeded** |
| `;` | PowerShell / Bash | Run next command **regardless of the previous result** |

Use `&&` when you want the build to stop immediately if `gradlew clean` fails — safer for debugging.

#### Part 3: `gradlew clean`

```cmd
gradlew clean
```

- `gradlew` = **Gradle Wrapper** — the script that downloads and runs the correct Gradle version for your project (defined in `gradle/wrapper/gradle-wrapper.properties`). You never need to install Gradle globally.
- `clean` = **deletes the entire `android/app/build/` folder** — all cached intermediate files, half-compiled classes, old assets.
- Fixes ~90% of strange native compilation errors by forcing a complete rebuild from scratch.

#### Part 4: `cd .. && npm run android`

```cmd
cd .. && npm run android
```

- `cd ..` = step back out of the `android/` folder to the project root (required because `npm run android` must be called from the root).
- `npm run android` = executes the `"android"` script from your `package.json`, which:
  1. Starts the **Metro Bundler** (bundles your JavaScript).
  2. Calls **Gradle** to compile the native Java/Kotlin code.
  3. Builds the debug APK.
  4. Pushes the APK to your connected device or emulator via `adb`.

---

### Essential Companion Commands

#### Check active Java version
```bash
java -version
```
Run this **after** setting `JAVA_HOME` to confirm the override worked before triggering a build.

#### Kill the Gradle Daemon (the "reset" button)
```bash
# Windows
.\gradlew --stop

# macOS / Linux
./gradlew --stop
```
Gradle keeps a background **Daemon** process running to speed up future builds. Sometimes it gets corrupted or locks up. This forces it to shut down so it starts fresh on the next build.

#### Build a production Release APK (for manual install / testing)
```bash
# Windows
cd android && .\gradlew assembleRelease

# macOS / Linux
cd android && ./gradlew assembleRelease
```
Builds an optimized, signed `.apk` you can install directly on a real device or send to testers. Output: `android/app/build/outputs/apk/release/app-release.apk`

#### Build an App Bundle for Google Play Store
```bash
# Windows
cd android && .\gradlew bundleRelease

# macOS / Linux
cd android && ./gradlew bundleRelease
```
Compiles your app into an `.aab` (Android App Bundle) — the format **required by Google Play** for new app submissions. Google Play then generates device-optimized APKs from the AAB automatically.

#### Check which Java Gradle is actually using
```bash
cd android && ./gradlew --version
```
Prints the Gradle version AND the JVM it is running on. Use this to confirm your `JAVA_HOME` override is taking effect.

#### Find where JDK versions are installed (macOS)
```bash
/usr/libexec/java_home -V
```
Lists all installed JDKs with their paths. Copy the correct path into your `JAVA_HOME` export.

#### Find where JDK versions are installed (Windows)
```cmd
dir "C:\Program Files\Java\"
```

---

### Making JAVA_HOME Permanent

**macOS / Linux — add to `~/.zshrc` or `~/.bashrc`:**
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```
Then run `source ~/.zshrc` to reload.

**Windows — set via System Properties:**
1. Search "Edit environment variables" → System Variables.
2. Add new variable: `JAVA_HOME` = `C:\Program Files\Java\jdk-21.0.10`
3. Edit `PATH` → add `%JAVA_HOME%\bin`
4. Restart terminal.

---

## 9. Common Build & Compilation Errors

> Both React Native and Flutter have predictable categories of build failures. This section maps the most common error messages to their root cause and exact fix.

---

### React Native — Common Android Build Errors

---

#### ❌ Error: `Unsupported class file major version 65` (or 61, 63)

**What it means:** Gradle is being run by the wrong JDK version. Class file version 65 = Java 21, 61 = Java 17, 63 = Java 19. The number tells you what version **compiled** the code, not what's running it.

**Root cause:** Your `JAVA_HOME` points to an older JDK that can't read class files compiled by a newer one.

**Fix:**
```bash
# Set correct JAVA_HOME (see Section 8)
export JAVA_HOME=/path/to/jdk-21
cd android && ./gradlew clean && cd .. && npm run android
```

---

#### ❌ Error: `SDK location not found. Define ANDROID_HOME in the local.properties file`

**What it means:** Gradle cannot find your Android SDK installation.

**Fix — Option 1:** Create `android/local.properties` manually:
```properties
# Windows
sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk

# macOS / Linux
sdk.dir=/Users/YourName/Library/Android/sdk
```

**Fix — Option 2:** Set the environment variable permanently:
```bash
# macOS ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH
```

---

#### ❌ Error: `Could not resolve com.android.tools.build:gradle:X.X.X`

**What it means:** Gradle cannot download the Android Gradle Plugin because it can't reach Maven repositories, or the requested version doesn't exist.

**Root cause:** Network issue, outdated `build.gradle` version reference, or company firewall blocking Maven Central.

**Fix:**
```bash
# Check your android/build.gradle — update to a valid AGP version
# Example: classpath("com.android.tools.build:gradle:8.3.0")

# Force re-download dependencies
cd android && ./gradlew clean build --refresh-dependencies
```

---

#### ❌ Error: `ENOENT: no such file or directory, open '...node_modules/...'`

**What it means:** A package listed in `package.json` is missing from `node_modules`.

**Fix:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
# then rebuild
npx react-native run-android
```

---

#### ❌ Error: `Metro Bundler: Unable to resolve module X`

**What it means:** Metro cannot find the imported module. Either the package isn't installed, or Metro's cache has a stale reference.

**Fix:**
```bash
# Clear Metro cache and restart
npx react-native start --reset-cache

# If package is missing, install it first
npm install <package-name>
npx react-native run-android
```

---

#### ❌ Error: `Execution failed for task ':app:mergeDebugNativeLibs'` or `duplicate .so files`

**What it means:** Two dependencies are including conflicting versions of the same native `.so` library.

**Fix — add to `android/app/build.gradle`:**
```gradle
android {
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libfbjni.so'
    }
}
```

---

#### ❌ Error: `Task :app:installDebug FAILED — adb: device offline` / `no devices`

**What it means:** ADB (Android Debug Bridge) cannot see your emulator or physical device.

**Fix:**
```bash
# List connected devices
adb devices

# Restart ADB server
adb kill-server
adb start-server

# For physical device: ensure USB Debugging is ON in Developer Options
# For emulator: make sure it finished booting before running
```

---

#### ❌ Error: `Gradle sync failed: Could not GET 'https://jcenter.bintray.com/...'`

**What it means:** JCenter (an old Maven repository) was shut down in 2021. Any project still pointing to JCenter will fail.

**Fix — update `android/build.gradle` repositories:**
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()   // ← replace jcenter() with this
    }
}
```

---

#### ❌ Error: `error: package com.facebook.react does not exist`

**What it means:** React Native's Android libraries are not linked or the project was not built after installing React Native.

**Fix:**
```bash
cd android && ./gradlew clean
cd .. && npm install
npx react-native run-android
```

---

### React Native — Common iOS Build Errors

---

#### ❌ Error: `CocoaPods not found` / `pod: command not found`

**What it means:** CocoaPods (iOS dependency manager) is not installed.

**Fix:**
```bash
sudo gem install cocoapods
# or with Homebrew (recommended)
brew install cocoapods

cd ios && pod install
```

---

#### ❌ Error: `The following build commands failed: CompileC ...`

**What it means:** A native iOS dependency failed to compile, usually due to a missing pod or Xcode Command Line Tools.

**Fix:**
```bash
# Reinstall Xcode Command Line Tools
xcode-select --install

# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd .. && npx react-native run-ios
```

---

#### ❌ Error: `Signing for "AppName" requires a development team`

**What it means:** Xcode needs an Apple Developer account to sign the app for a physical device.

**Fix:** Open `ios/AppName.xcworkspace` in Xcode → select your target → **Signing & Capabilities** → select your Apple ID Team. For emulator testing, set to "Sign to Run Locally."

---

### Flutter — Common Android Build Errors

---

#### ❌ Error: `Flutter requires Android SDK 21 or higher`

**What it means:** Your `minSdkVersion` in `android/app/build.gradle` is set below Flutter's minimum.

**Fix — update `android/app/build.gradle`:**
```gradle
android {
    defaultConfig {
        minSdkVersion 21   // Flutter requires at least 21
    }
}
```

---

#### ❌ Error: `Gradle task assembleDebug failed with exit code 1`

**What it means:** Generic Gradle compilation failure. The actual cause is always in the lines above this message.

**Fix — standard troubleshooting sequence:**
```bash
flutter clean
flutter pub get
flutter run
```

If it persists:
```bash
cd android && ./gradlew clean
cd .. && flutter run -v    # verbose mode shows the real error
```

---

#### ❌ Error: `Could not resolve io.flutter:flutter_embedding_debug`

**What it means:** Gradle cannot download Flutter's Android embedding libraries. Usually a network/proxy issue or stale Gradle cache.

**Fix:**
```bash
flutter clean
rm -rf ~/.gradle/caches       # macOS/Linux — clears entire Gradle cache
flutter pub get
flutter run
```

Windows:
```cmd
rmdir /s /q %USERPROFILE%\.gradle\caches
```

---

#### ❌ Error: `Execution failed for task ':app:checkDebugAarMetadata'`

**What it means:** A dependency's compiled AAR is incompatible with your `compileSdkVersion` or `minSdkVersion`.

**Fix — update `android/app/build.gradle`:**
```gradle
android {
    compileSdkVersion 34    // bump to latest
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
    }
}
```
Then run `flutter clean && flutter run`.

---

#### ❌ Error: `The plugin X requires a higher Android SDK version`

**What it means:** A pub package you installed requires a higher `minSdkVersion` than what your project declares.

**Fix:** Check the plugin's documentation for its minimum SDK requirement, then update `minSdkVersion` in `android/app/build.gradle` to match.

---

#### ❌ Error: `No connected devices` when running `flutter run`

**What it means:** Flutter cannot detect any running emulator or physical device.

**Fix:**
```bash
# List what Flutter sees
flutter devices

# Start an Android emulator
flutter emulators
flutter emulators --launch <emulator_id>

# For physical device: enable USB Debugging, then
adb devices    # confirm device is listed
flutter run
```

---

#### ❌ Error: `MissingPluginException(No implementation found for method X on channel Y)`

**What it means:** A platform channel method is being called but the native implementation was never registered — usually because you added a plugin but didn't run `flutter pub get` or didn't restart the app.

**Fix:**
```bash
flutter pub get
# Stop and fully restart the app (Hot Reload is not enough for new plugins)
flutter run
```

If it still fails: run `flutter clean && flutter pub get && flutter run`.

---

### Flutter — Common iOS Build Errors

---

#### ❌ Error: `CocoaPods not installed or not in valid state`

**Fix:**
```bash
sudo gem install cocoapods
cd ios && pod install --repo-update
cd .. && flutter run
```

---

#### ❌ Error: `The iOS deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is set to X.0, but the range of supported deployment target versions is Y.0 to Z.0`

**What it means:** A pod requires a higher iOS minimum version than your project declares.

**Fix — update `ios/Podfile`:**
```ruby
platform :ios, '13.0'   # bump to at least 13.0
```
Then:
```bash
cd ios && pod install
cd .. && flutter run
```

---

#### ❌ Error: `Dart snapshot is not compatible with the VM`

**What it means:** The compiled Dart snapshot in your build cache was built for a different Flutter version. Happens after upgrading Flutter.

**Fix:**
```bash
flutter clean
flutter pub get
flutter run
```

---

### General Debugging Flow for Both Frameworks

When any build fails, follow this sequence before searching for the specific error:

```
Step 1: Read the full error — the real cause is usually 10-20 lines above the last line
Step 2: flutter clean / gradlew clean  → removes stale cache
Step 3: flutter pub get / npm install  → ensures dependencies are installed
Step 4: Rerun with verbose logging     → flutter run -v  /  npx react-native run-android --verbose
Step 5: Kill Gradle daemon             → ./gradlew --stop
Step 6: Restart the emulator / device
Step 7: Search the exact error message + your RN/Flutter version
```

---

## 10. Cross-Platform: React Native vs Flutter

### Q: Is Flutter more cross-platform than React Native?

**Flutter requires significantly fewer code changes** (95–100% code reuse for standard apps).

| Feature | React Native | Flutter |
|---|---|---|
| UI Layout & Styling | Frequent fixes needed (shadows, fonts, margins differ per OS) | Pixel-identical on both platforms out of the box |
| Platform Navigation | Minor tweaks (Android back button vs iOS swipe) | Unified router, no changes needed |
| Native Device Features | Moderate (separate linking for Android/iOS) | Low (community packages standardize this well) |
| Widget Appearance | Uses real OS widgets — looks different per platform | Draws own widgets — identical everywhere |

Both require platform-specific code only for things like Apple Pay vs Google Pay, Home Screen Widgets, or OS-specific permissions.

---

### Q: Does Flutter use the same runtime flow as React Native?

No — fundamentally different:

| Step | React Native | Flutter |
|---|---|---|
| App Boot | OS boots Hermes C++ VM, reads bytecode | OS executes compiled ARM binary directly |
| Logic Execution | Hermes reads `.hbc` bytecode line-by-line | CPU runs native machine instructions |
| UI Rendering | JSI → tells Android/iOS to draw native OS widgets | Flutter engine → GPU draws every pixel on canvas |

---

### Q: Does Flutter have an equivalent to React Native's Codegen for accessing new native APIs?

Yes — Flutter offers two approaches:

**Pigeon (direct Codegen equivalent):**
- Write a Dart spec → Pigeon auto-generates Kotlin, Swift, and Dart bridge code.
- You then write only the final native logic in `MainActivity.kt`.

**JNIgen / FFIgen (Flutter's unique superpower):**
- Feed an Android SDK package or `.jar`/`.aar` file into JNIgen.
- JNIgen generates Dart wrappers directly from native Android source.
- Result: Call Android Java/Kotlin APIs directly in Dart without entering the `android/` folder.

```dart
// Example — calling a new Android API directly in Dart via JNIgen
import 'package:android_sdk/api/new_feature.dart';

void useNewFeature() {
  final manager = NewFeatureManager();
  manager.triggerZeroDayAPI();
}
```

---

## 11. Limitations

### Q: Is everything possible in React Native?

No — approximately 95% of standard mobile apps are achievable, but there are hard limits:

**Impossible in React Native:**
- AAA 3D games (Call of Duty, Genshin Impact level) → use Unity/Unreal.
- Custom Android Launchers or OS-level system modifications.
- Reliable, heavy continuous background processing.

**Hard but possible (requires native Turbo Modules):**
- Real-time video filters (Snapchat/TikTok-style) → requires native GPU/camera access.
- High-throughput Bluetooth/IoT data streaming → requires native stability.
- Home Screen Widgets, Apple Watch / Wear OS apps → pure native code required.

**React Native is ideal for:** Data-driven apps (auth, APIs, media, payments). Instagram, Shopify, Skype, and Pinterest all use React Native.

---

### Q: Can Flutter do everything React Native can?

Both share the same fundamental OS-level limitations:

**Neither can do:**
- AAA 3D gaming → use Unity / Unreal Engine.
- Custom Android Launchers or device drivers.
- Reliable heavy background processing.

**Flutter does better:**
- Complex 2D animations at 60/120 FPS.
- Pixel-perfect UI consistency across all devices.
- Light 2D games (using the Flame engine).

**React Native does better:**
- Integration with existing native codebases.
- Faster onboarding for web/JS developers.

---

## 12. Error Handling & Debugging

### Q: Can bytecode that compiled successfully still fail at runtime?

Yes — the Hermes compiler only catches **syntax errors** at build time. Many failures only surface at runtime:

| Error Type | Caught at Build? | Caught at Runtime? |
|---|---|---|
| Syntax typos, missing brackets | ✅ Yes | — |
| Missing native Android modules | ❌ No | ✅ Crashes with `TypeError` |
| Unsupported JavaScript (ES) features | ❌ No | ✅ Crashes with `ReferenceError` |
| Null/undefined API response data | ❌ No | ✅ Crashes with `Cannot read property` |
| Memory leaks / infinite loops | ❌ No | ✅ OS kills the process |

**Best practices to catch runtime errors early:**
- Use **TypeScript** for type safety.
- Add **Error Boundaries** in React to catch render failures gracefully.
- Use tools like **Sentry** or **Bugsnag** for production crash reporting.
- Test on both Android emulator and physical device before release.

---

## 13. State Management

### React Native State Management Options

| Library | Best For | Approach |
|---|---|---|
| **useState / useReducer** | Simple local component state | Built-in React hooks |
| **Context API** | Lightweight global state (theme, auth) | Built-in React, no library needed |
| **Redux Toolkit** | Large apps, complex state, time-travel debugging | Centralized store + reducers |
| **Zustand** | Medium apps, minimal boilerplate | Lightweight store with hooks |
| **Jotai / Recoil** | Atomic state, fine-grained updates | Atom-based (per-value state) |
| **React Query / TanStack Query** | Server state, caching, API calls | Async data fetching + caching layer |
| **MobX** | OOP-style reactive state | Observable-based auto-tracking |

---

### Flutter State Management Options

| Library | Best For | Approach |
|---|---|---|
| **setState()** | Simple local widget state | Built-in Flutter |
| **InheritedWidget** | Low-level shared state | Built-in, but verbose |
| **Provider** | Most apps — wraps InheritedWidget | Official community recommendation |
| **Riverpod** | Provider replacement — compile-safe, testable | Atom-based, no BuildContext needed |
| **Bloc / Cubit** | Large apps, strict separation of concerns | Event → State streams |
| **GetX** | Fast setup — state + routing + DI in one | All-in-one, opinionated |
| **MobX (Dart)** | Reactive OOP-style | Observable-based |

---

## 14. Hot Reload vs Fast Refresh vs Hot Restart

### React Native

| Feature | What it does | When to use |
|---|---|---|
| **Fast Refresh** | Injects changed JS code into running app — preserves component state | Default in dev mode; use for UI tweaks |
| **Full Reload** | Reloads entire JS bundle — state is lost | When Fast Refresh doesn't pick up changes |
| **Rebuild** | Full native + JS rebuild | When you change native code (Kotlin/Swift) or add packages |

```bash
# In Metro terminal, press:
r   → Fast Refresh / Reload
d   → Open Dev Menu
j   → Open Debugger
```

---

### Flutter

| Feature | What it does | When to use |
|---|---|---|
| **Hot Reload** | Injects changed Dart code — preserves widget state and scroll position | Default; for UI and logic changes |
| **Hot Restart** | Restarts the Dart VM — state is lost but no full rebuild | When state is corrupted or you need a clean start |
| **Full Restart** | Kills and rebuilds the native app | When you add plugins or change native code |

```bash
# In flutter run terminal, press:
r   → Hot Reload
R   → Hot Restart
q   → Quit
p   → Toggle debug paint (shows widget bounds)
o   → Toggle target platform (Android ↔ iOS)
```

**Key difference:** Flutter's Hot Reload preserves widget state (your scroll position, text inputs) because the element tree survives. React Native's Fast Refresh can sometimes lose component state depending on the change.

---

## 15. Navigation

### React Native Navigation Libraries

**React Navigation (most popular):**
```bash
npm install @react-navigation/native
npm install @react-navigation/stack          # Stack navigator
npm install @react-navigation/bottom-tabs   # Tab navigator
npm install @react-navigation/drawer        # Drawer navigator
```

```jsx
// Basic Stack setup
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Navigate between screens
navigation.navigate('Details', { itemId: 42 });
navigation.goBack();
```

**React Native Navigation (Wix — uses true native navigation):**
```bash
npm install react-native-navigation
```

---

### Flutter Navigation

**Navigator 1.0 (imperative — simple apps):**
```dart
// Push a new screen
Navigator.push(context,
  MaterialPageRoute(builder: (context) => DetailsScreen()),
);

// Pop back
Navigator.pop(context);

// Push and replace (no back button)
Navigator.pushReplacement(context,
  MaterialPageRoute(builder: (context) => HomeScreen()),
);
```

**GoRouter (recommended — declarative, deep links):**
```bash
flutter pub add go_router
```

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (context, state) => HomeScreen()),
  GoRoute(path: '/details/:id', builder: (context, state) {
    final id = state.pathParameters['id'];
    return DetailsScreen(id: id!);
  }),
]);

// Navigate
context.go('/details/42');
context.pop();
```

---

## 16. Performance Optimization

### React Native Performance

#### The Golden Rule
JavaScript runs on a single thread. Anything that blocks that thread for more than ~16ms causes a dropped frame (jank). Keep your JS thread free and push heavy work to native threads.

---

#### Use FlatList instead of ScrollView for long lists

`ScrollView` renders **all** children at once — if you have 500 list items, all 500 are in memory. `FlatList` uses a **windowing** technique: it only renders items visible on screen plus a small buffer, recycling views as you scroll.

```jsx
// ❌ Bad for long lists — renders everything at once
<ScrollView>
  {data.map(item => <ItemComponent key={item.id} item={item} />)}
</ScrollView>

// ✅ Good — renders only visible items
<FlatList
  data={data}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <ItemComponent item={item} />}
  initialNumToRender={10}          // render 10 items on mount
  maxToRenderPerBatch={10}         // render 10 more items per batch
  windowSize={5}                   // render 5 viewports worth of items
  removeClippedSubviews={true}     // unmount off-screen views (Android)
  getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })} // skip layout calculation if items are fixed height
/>
```

**`SectionList`** works the same way but supports grouped sections with headers.

---

#### Memoization — stop unnecessary re-renders

```jsx
// React.memo — skip re-render if props haven't changed
const ItemComponent = React.memo(({ item }) => {
  return <Text>{item.name}</Text>;
});

// useCallback — stable function reference across renders
const handlePress = useCallback(() => {
  navigation.navigate('Details', { id: item.id });
}, [item.id]);

// useMemo — expensive computation cached between renders
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);
```

---

#### Move heavy work off the JS thread

```jsx
// InteractionManager — defer work until after animations complete
import { InteractionManager } from 'react-native';

useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    // Heavy data processing — runs after screen transition finishes
    processLargeDataset();
  });
  return () => task.cancel();
}, []);
```

---

#### StyleSheet — create styles once, not on every render

```jsx
// ❌ Bad — creates a new object on every render
<View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>

// ✅ Good — StyleSheet.create caches styles and validates at dev time
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 16 }
});
<View style={styles.container}>
```

`StyleSheet.create()` sends styles to the native layer once and references them by ID — no repeated object serialization on every render.

---

#### Image optimization

```jsx
import FastImage from 'react-native-fast-image'; // better than built-in Image

<FastImage
  source={{ uri: 'https://...', priority: FastImage.priority.high }}
  resizeMode={FastImage.resizeMode.contain}
/>
```

- Use `FastImage` (wraps Glide on Android, SDWebImage on iOS) for caching and faster loading.
- Always specify explicit `width` and `height` so layout isn't recalculated after the image loads.
- Use WebP format — 25–34% smaller than PNG/JPEG with the same quality.

---

### Flutter Performance

#### Use `const` constructors wherever possible

```dart
// ❌ Rebuilt on every setState
Text('Hello World')

// ✅ Never rebuilt — Flutter skips it entirely
const Text('Hello World')
```

`const` widgets are identical objects in memory — Flutter's reconciler skips them during rebuild. Add `const` to any widget whose properties never change at runtime.

---

#### Use ListView.builder for long lists

```dart
// ❌ Bad — renders all 1000 items at once
ListView(
  children: items.map((item) => ItemWidget(item: item)).toList(),
)

// ✅ Good — renders only visible items
ListView.builder(
  itemCount: items.length,
  itemExtent: 80.0,          // fixed height enables scroll position optimisation
  itemBuilder: (context, index) => ItemWidget(item: items[index]),
)
```

---

#### RepaintBoundary — isolate expensive widgets

```dart
// Wrapping an animated widget in RepaintBoundary prevents
// it from forcing the parent to repaint
RepaintBoundary(
  child: AnimatedSpinner(),
)
```

Without `RepaintBoundary`, an animation in a child can trigger the entire parent tree to repaint every frame.

---

#### Keys — help Flutter identify widgets across rebuilds

```dart
// ValueKey — use when item identity matters (reorderable lists)
ListView.builder(
  itemBuilder: (context, index) => ItemWidget(
    key: ValueKey(items[index].id),  // stable identity
    item: items[index],
  ),
)

// GlobalKey — access widget state from outside
final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
Form(key: _formKey, child: ...)
_formKey.currentState!.validate();
```

Without keys, Flutter may reuse the wrong widget state when the list order changes, causing visual glitches.

---

## 17. Animations

### React Native Animations

#### Animated API (built-in, runs on JS thread by default)

```jsx
import { Animated, Easing } from 'react-native';

// Create an animated value
const fadeAnim = useRef(new Animated.Value(0)).current;

// Trigger on mount
useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 500,
    easing: Easing.ease,
    useNativeDriver: true,  // ← CRITICAL: runs on UI thread, not JS thread
  }).start();
}, []);

// Use in JSX
<Animated.View style={{ opacity: fadeAnim }}>
  <Text>Fades in</Text>
</Animated.View>
```

> **`useNativeDriver: true`** is the most important performance flag. It sends the animation to the native UI thread so it keeps running even if the JS thread is busy. Supports `opacity`, `transform` (translate, scale, rotate). Does **not** support `width`, `height`, `backgroundColor` (use Reanimated for those).

**Common animation types:**
```jsx
Animated.timing(value, { toValue, duration, useNativeDriver: true })   // time-based
Animated.spring(value, { toValue, friction: 7, tension: 40, useNativeDriver: true }) // physics spring
Animated.decay(value, { velocity: 0.5, deceleration: 0.997, useNativeDriver: true }) // momentum

// Sequence and parallel
Animated.sequence([anim1, anim2]).start();    // one after another
Animated.parallel([anim1, anim2]).start();    // simultaneously
Animated.stagger(100, [anim1, anim2]).start(); // staggered start
```

---

#### React Native Reanimated (recommended for complex animations)

Reanimated 3 runs animations **entirely on the UI thread** using Worklets — small JS functions compiled to native code.

```bash
npm install react-native-reanimated
```

```jsx
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming
} from 'react-native-reanimated';

const offset = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));

// Trigger animation — runs entirely on UI thread
offset.value = withSpring(100);

<Animated.View style={[styles.box, animatedStyle]} />
```

Reanimated is required for gesture-driven animations (drag, swipe, pinch-to-zoom) via `react-native-gesture-handler`.

---

### Flutter Animations

#### Implicit Animations (simplest — Flutter handles the animation)

```dart
// AnimatedContainer — automatically animates between value changes
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  curve: Curves.easeInOut,
  width: _expanded ? 200 : 100,
  height: _expanded ? 200 : 100,
  color: _expanded ? Colors.blue : Colors.red,
)

// AnimatedOpacity
AnimatedOpacity(
  opacity: _visible ? 1.0 : 0.0,
  duration: Duration(milliseconds: 500),
  child: Text('Hello'),
)
```

---

#### Explicit Animations (full control via AnimationController)

```dart
class MyWidget extends StatefulWidget { ... }

class _MyWidgetState extends State<MyWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 500),
      vsync: this,   // vsync ties animation to screen refresh rate
    );
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();   // always dispose to prevent memory leaks
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _animation, child: Text('Hello'));
  }
}
```

---

## 18. Testing

### React Native Testing

#### Unit Tests with Jest

Jest is included by default in every React Native project.

```bash
# Run all tests
npx jest

# Run in watch mode
npx jest --watch

# Run with coverage report
npx jest --coverage

# Run a specific test file
npx jest __tests__/MyComponent.test.tsx
```

```tsx
// Example unit test
import { sum } from '../utils/math';

test('adds two numbers correctly', () => {
  expect(sum(2, 3)).toBe(5);
});
```

---

#### Component Tests with React Native Testing Library

```bash
npm install --save-dev @testing-library/react-native
```

```tsx
import { render, fireEvent, screen } from '@testing-library/react-native';
import LoginButton from '../components/LoginButton';

test('calls onPress when tapped', () => {
  const onPressMock = jest.fn();
  render(<LoginButton onPress={onPressMock} label="Login" />);

  fireEvent.press(screen.getByText('Login'));

  expect(onPressMock).toHaveBeenCalledTimes(1);
});
```

---

#### End-to-End Tests with Detox

Detox runs real UI automation on a simulator/emulator — no mocking.

```bash
npm install --save-dev detox
npx detox build --configuration android.emu.debug
npx detox test --configuration android.emu.debug
```

```js
// Example Detox e2e test
describe('Login screen', () => {
  it('should log in successfully', async () => {
    await element(by.id('email-input')).typeText('user@test.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

---

### Flutter Testing

Flutter has a built-in, first-class three-tier testing system.

#### Unit Tests

```bash
flutter test test/unit/math_test.dart
```

```dart
// test/unit/math_test.dart
import 'package:test/test.dart';
import 'package:my_app/utils/math.dart';

void main() {
  test('adds two numbers correctly', () {
    expect(sum(2, 3), equals(5));
  });

  group('Calculator', () {
    test('division throws on zero', () {
      expect(() => divide(10, 0), throwsArgumentError);
    });
  });
}
```

---

#### Widget Tests

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/widgets/login_button.dart';

void main() {
  testWidgets('LoginButton shows label and fires callback', (tester) async {
    bool pressed = false;

    await tester.pumpWidget(MaterialApp(
      home: LoginButton(label: 'Login', onPressed: () => pressed = true),
    ));

    expect(find.text('Login'), findsOneWidget);

    await tester.tap(find.byType(LoginButton));
    await tester.pump();   // trigger rebuild

    expect(pressed, isTrue);
  });
}
```

---

#### Integration Tests (full app on real device/emulator)

```bash
flutter test integration_test/app_test.dart
```

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('full login flow', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(Key('email')), 'user@test.com');
    await tester.tap(find.byKey(Key('login-btn')));
    await tester.pumpAndSettle();

    expect(find.byKey(Key('home-screen')), findsOneWidget);
  });
}
```

---

## 19. OTA Updates & CodePush

### What is an OTA Update?

OTA (Over-The-Air) updates allow you to push JavaScript bundle updates directly to users' installed apps — **without going through the App Store or Play Store review process**. Only the JS bundle changes; native code updates still require a full store release.

> ⚠️ Apple's App Store guidelines allow OTA updates only for **bug fixes and minor improvements** using the same native binary. You cannot add new native features or substantially change app functionality via OTA.

---

### React Native — CodePush (by Microsoft / App Center)

```bash
npm install react-native-code-push
npm install -g appcenter-cli
appcenter login
```

```jsx
// Wrap your root component
import CodePush from 'react-native-code-push';

const App = () => <MainNavigator />;

export default CodePush({
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  installMode: CodePush.InstallMode.IMMEDIATE,
})(App);
```

```bash
# Release a JS-only update to Android users
appcenter codepush release-react -a MyOrg/MyApp-Android -d Production

# Release to iOS
appcenter codepush release-react -a MyOrg/MyApp-iOS -d Production

# Check deployment history
appcenter codepush deployment history -a MyOrg/MyApp-Android Production
```

---

### Expo — EAS Update (modern OTA for Expo projects)

```bash
npm install expo-updates
eas update --branch production --message "Fix login crash"
```

EAS Update is the recommended OTA solution for Expo-managed projects and replaces the older `expo publish` command.

---

### Flutter — No Built-in OTA

Flutter compiles Dart to **native ARM machine code** — you cannot swap out machine code via OTA the way you can swap a JS bundle. Full store releases are required for any code changes.

Workarounds used in practice:
- **Remote config** (Firebase Remote Config) — change app behavior without code changes.
- **Server-driven UI** — fetch UI structure as JSON from your backend and render it dynamically.
- These are design patterns, not true OTA updates.

---

## 20. Security & Storage

### React Native Storage Options

| Storage Type | Library | Use For | Security |
|---|---|---|---|
| **AsyncStorage** | `@react-native-async-storage/async-storage` | Non-sensitive user preferences, cached data | ❌ Plain text — not encrypted |
| **Secure Storage** | `react-native-keychain` | Passwords, tokens, secrets | ✅ Uses Android Keystore / iOS Keychain |
| **SQLite** | `react-native-sqlite-storage` / `expo-sqlite` | Structured relational data offline | Medium — encrypt with SQLCipher |
| **MMKV** | `react-native-mmkv` | High-performance key-value (replaces AsyncStorage) | Optional encryption |
| **Realm** | `@realm/react` | Complex offline-first data with sync | ✅ Built-in encryption |

```jsx
// ✅ Secure storage for tokens
import * as Keychain from 'react-native-keychain';

// Save
await Keychain.setGenericPassword('token', accessToken);

// Retrieve
const credentials = await Keychain.getGenericPassword();
if (credentials) {
  const token = credentials.password;
}

// Delete
await Keychain.resetGenericPassword();
```

```jsx
// ❌ Never store sensitive data in AsyncStorage
await AsyncStorage.setItem('accessToken', token); // visible in plain text on device
```

---

### Flutter Storage Options

| Storage Type | Package | Use For | Security |
|---|---|---|---|
| **SharedPreferences** | `shared_preferences` | Simple key-value (settings, flags) | ❌ Plain text |
| **Flutter Secure Storage** | `flutter_secure_storage` | Tokens, passwords | ✅ Android Keystore / iOS Keychain |
| **SQLite** | `sqflite` | Relational data | Medium |
| **Hive** | `hive` | Fast NoSQL key-value | Optional encryption |
| **Isar** | `isar` | High-performance NoSQL with full-text search | Optional encryption |

```dart
// ✅ Secure storage
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const storage = FlutterSecureStorage();

// Write
await storage.write(key: 'access_token', value: token);

// Read
final token = await storage.read(key: 'access_token');

// Delete
await storage.delete(key: 'access_token');
```

---

### Security Best Practices (Both Frameworks)

- **Never hardcode API keys** in JS/Dart source code — they end up in the app bundle and can be extracted.
- Use **environment variables** via `.env` files (`react-native-config` / `flutter_dotenv`) and exclude from version control.
- **Certificate pinning** — validate the server's SSL certificate fingerprint in the app to prevent man-in-the-middle attacks.
- **ProGuard / R8** (Android) — enables code shrinking and obfuscation to make reverse engineering harder.

```gradle
// android/app/build.gradle — enable R8 obfuscation for release
buildTypes {
    release {
        minifyEnabled true          // enables R8 code shrinking + obfuscation
        shrinkResources true        // removes unused resources
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## 21. Debugging Tools

### React Native Debugging

#### React Native DevTools (built-in, RN 0.73+)
```bash
# Open DevTools from Metro terminal
j   # press j in the Metro terminal to open the JS debugger
```
Provides a full Chrome DevTools-style interface: breakpoints, call stack, variable inspection, network requests.

---

#### Flipper (Meta's desktop debugging platform)
```bash
# Download from https://fbflipper.com
# Plugins: Network Inspector, React DevTools, Async Storage Inspector, Crash Reporter
```
Connect Flipper to your running app to inspect network requests, view AsyncStorage contents, browse the component tree, and see native logs — all in one desktop UI.

---

#### Reactotron (community alternative to Flipper)
```bash
npm install --save-dev reactotron-react-native
```
Lightweight desktop app for logging, state inspection (Redux/MobX), API monitoring, and benchmark tracking.

---

#### Android Logcat (native logs)
```bash
# View all Android logs
adb logcat

# Filter to just your app
adb logcat --pid=$(adb shell pidof -s com.yourpackagename)

# Filter by tag
adb logcat -s ReactNativeJS

# Clear log buffer
adb logcat -c
```

---

#### iOS device logs
```bash
# Stream logs from connected iOS device (macOS)
idevicesyslog

# Or use Xcode → Window → Devices and Simulators → select device → View Device Logs
```

---

### Flutter Debugging

#### Flutter DevTools (official, built-in)
```bash
# Launch DevTools from terminal
flutter pub global activate devtools
flutter pub global run devtools

# Or when running flutter run, press:
# v → open Flutter DevTools in browser automatically
```

DevTools features:
- **Widget Inspector** — visualize the entire widget tree, see constraints, inspect sizes.
- **Performance** — flame chart of frame rendering, identify jank.
- **Memory** — heap usage, detect leaks.
- **Network** — inspect HTTP requests/responses.
- **Logging** — structured app logs.

---

#### Debug print and logging in Flutter
```dart
// Simple debug print (stripped in release builds)
debugPrint('Value: $myValue');

// Structured logging
import 'package:logging/logging.dart';
final log = Logger('MyClass');
log.info('User logged in');
log.warning('Token expires soon');
log.severe('Network request failed', error, stackTrace);
```

---

#### Android Studio / VS Code Flutter extension
Both IDEs provide breakpoint debugging directly in Dart code — set a breakpoint, press F5, and step through your widget's `build()` method line by line.

---

## 22. CI/CD & Release Automation

### React Native — CI/CD

#### GitHub Actions — Android build example
```yaml
# .github/workflows/android.yml
name: Android Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Install Node dependencies
        run: npm install

      - name: Build release AAB
        run: cd android && ./gradlew bundleRelease

      - name: Upload AAB artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/app-release.aab
```

---

#### Fastlane — automate signing, building, and store upload
```bash
gem install fastlane
cd android && fastlane init
```

```ruby
# android/fastlane/Fastfile
lane :deploy do
  gradle(task: 'bundle', build_type: 'Release')
  upload_to_play_store(track: 'production', aab: 'app/build/outputs/bundle/release/app-release.aab')
end
```

```bash
fastlane deploy
```

---

### Flutter — CI/CD

#### GitHub Actions — Flutter Android build
```yaml
# .github/workflows/flutter.yml
name: Flutter Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.22.0'
          channel: 'stable'

      - name: Install dependencies
        run: flutter pub get

      - name: Run tests
        run: flutter test

      - name: Build release AAB
        run: flutter build appbundle --release

      - name: Upload AAB
        uses: actions/upload-artifact@v4
        with:
          name: flutter-release
          path: build/app/outputs/bundle/release/app-release.aab
```

---

#### Fastlane for Flutter
```ruby
# fastlane/Fastfile
lane :deploy_android do
  sh("flutter build appbundle --release")
  upload_to_play_store(
    track: 'production',
    aab: '../build/app/outputs/bundle/release/app-release.aab'
  )
end

lane :deploy_ios do
  sh("flutter build ipa --release")
  upload_to_app_store(ipa: '../build/ios/ipa/MyApp.ipa')
end
```

---

#### Codemagic (Flutter-native CI/CD)
Codemagic is a CI/CD platform built specifically for Flutter. It handles code signing, building, and store publishing with minimal configuration — no Fastlane setup required. Configure via `codemagic.yaml` in your repo root.

---

## 23. Interview Questions & Answers

These are commonly asked in React Native and Flutter interviews, from junior to senior level.

---

### Q1: What is the role of Metro Bundler in React Native?

Metro Bundler is the JavaScript bundler that ships with React Native. It takes all your separate `.js` / `.ts` files and combines them into a single bundle file (`index.android.bundle`). During development it also runs a local dev server that supports Fast Refresh so you see changes in real time without a full rebuild. In production, the output bundle is compiled by Hermes to bytecode before being packed into the APK.

---

### Q2: What is Hermes and why does React Native use it?

Hermes is an open-source JavaScript engine built by Meta specifically optimized for React Native on mobile. Unlike V8 (used in Chrome/Node.js), Hermes compiles JavaScript to bytecode **ahead of time** on the developer's machine rather than at runtime. This dramatically reduces app startup time and lowers memory usage — critical on low-end Android devices.

---

### Q3: What is JSI (JavaScript Interface) and why was it introduced?

JSI is a C++ API that allows JavaScript to hold direct references to native host objects. Before JSI, React Native used an **asynchronous message bridge** (the "Old Bridge") that serialized all JS↔Native communication to JSON, which created lag and bottlenecks. JSI enables **synchronous, direct** calls between JavaScript and C++/native code, eliminating the serialization overhead entirely.

---

### Q4: What is the difference between the Old Architecture and the New Architecture in React Native?

| Aspect | Old Architecture | New Architecture |
|---|---|---|
| Bridge | Async JSON-serialized message queue | Synchronous JSI direct calls |
| Native Modules | Eagerly loaded at startup | Turbo Modules — loaded lazily on demand |
| UI Rendering | UIManager on single thread | Fabric — concurrent rendering, priority-based |
| Type Safety | Manual, error-prone | Codegen generates type-safe C++ bindings from TypeScript |
| Shadow Thread | Separate thread for layout | Shadow tree managed in C++, shared via JSI |

---

### Q5: What is Fabric in React Native?

Fabric is React Native's new rendering system (part of the New Architecture). It replaces the old UIManager and enables:
- **Concurrent rendering** — high-priority updates (animations) are not blocked by lower-priority ones.
- **Synchronous layout measurement** — eliminates layout flicker.
- The shadow tree now lives in C++ and is accessible directly via JSI — removing one async hop in the old pipeline.

---

### Q6: What is a Turbo Module and how is it different from a Native Module?

**Native Modules (Old Architecture):** Loaded eagerly at app startup (even if never used), communicated via the async bridge, required manual type mapping.

**Turbo Modules (New Architecture):** Loaded **lazily** (only when first called), communicate synchronously via JSI, and use Codegen to auto-generate type-safe C++ bindings from a TypeScript spec. The result is better startup performance and safer, faster native calls.

---

### Q7: What is Codegen in React Native and what problem does it solve?

Codegen is a build-time tool that reads TypeScript interface specifications and automatically generates the C++ glue code needed to connect JavaScript to native Android (Kotlin/Java) or iOS (Swift/Objective-C) code. It eliminates the need for developers to write error-prone manual bridge code and ensures type safety across the JS/Native boundary.

---

### Q8: What is Yoga in React Native?

Yoga is a cross-platform C++ layout engine built by Meta. It implements the **Flexbox** specification for mobile. When you apply `flexDirection`, `justifyContent`, `alignItems`, etc. to a `<View>`, Yoga calculates the exact pixel positions for every element on every screen size — identically on both Android and iOS. It is embedded in the React Native C++ core.

---

### Q9: What are the three trees Flutter maintains at runtime?

Flutter maintains three parallel trees:
- **Widget Tree** — immutable blueprints of the UI, rebuilt on every `setState()`.
- **Element Tree** — stateful, long-lived instances (like React's Virtual DOM). Flutter diffs this to find minimal changes.
- **Render Tree** — RenderObjects that do actual layout calculations and issue GPU paint calls.

This design means Flutter only repaints what actually changed, not the entire screen.

---

### Q10: What is the difference between Skia and Impeller in Flutter?

Both are Flutter's rendering engines that talk to the GPU. Skia was the original renderer that compiled GPU shaders at runtime — causing occasional "jank" (stutter) on the first render of new UI. Impeller is the new renderer (default since Flutter 3.10 on iOS, 3.16 on Android) that pre-compiles all shaders at build time, eliminating first-frame jank entirely.

---

### Q11: What are the differences between React Native's rendering approach and Flutter's?

React Native renders UI by instructing the **Android/iOS OS** to draw native platform widgets via JSI. Flutter bypasses platform widgets entirely and uses its own **GPU-accelerated rendering engine (Impeller)** to draw every pixel manually — similar to a game engine. This makes Flutter pixel-identical across platforms but means Flutter buttons don't automatically look like native Android buttons.

---

### Q12: What is the difference between Hot Reload and Hot Restart in Flutter?

**Hot Reload** injects changed Dart code into the running Dart VM and triggers a widget rebuild — preserving app state (scroll position, text inputs, navigation stack). **Hot Restart** restarts the Dart VM entirely, resetting all state, but does not do a full native rebuild. A **Full Restart** kills the app and rebuilds from scratch — required when you add a new plugin or change native Kotlin/Swift code.

---

### Q13: When would you choose Flutter over React Native, and vice versa?

**Choose Flutter when:**
- Pixel-perfect UI consistency across Android and iOS is critical.
- You're building animation-heavy or custom-designed UIs.
- You want maximum code reuse (including Web and Desktop in future).
- Your team is willing to learn Dart.

**Choose React Native when:**
- Your team has strong JavaScript/TypeScript skills.
- You need to integrate with an existing native Android/iOS codebase.
- You're building a standard data-driven app (auth, API calls, media).
- You want to share business logic with a web React app.

---

### Q14: What types of errors are caught at bundle time vs runtime in React Native?

**Bundle time (Hermes catches):** Syntax errors — missing brackets, bad imports, typos in keywords.

**Runtime (only detectable on device):** Missing native modules, unsupported JS features, null/undefined data from APIs, memory exhaustion from leaks or infinite loops.

Best practice: TypeScript + Error Boundaries + Sentry/Bugsnag for production crash reporting.

---

### Q15: Can you access a brand-new Android API in React Native without waiting for an npm package?

Yes. Using **Codegen + Turbo Modules**:
1. Write a TypeScript spec defining the new API's interface.
2. Run the build — Codegen auto-generates the C++ bridge.
3. Write a Kotlin file calling the new Android API.

This gives you zero-day access to any Android OS feature without waiting for the open-source community.

---

### Q16: How does Flutter access native Android APIs? What is a Platform Channel?

A Platform Channel is a named communication pipe between Dart and native (Kotlin/Swift). You define a channel name (e.g., `"com.myapp/battery"`), call `invokeMethod()` from Dart, and handle the call in `MainActivity.kt`. Data is passed as standard types (String, int, Map). **Pigeon** is the code-generator that makes this type-safe, the same way **Codegen** does for React Native Turbo Modules.

---

### Q17: What is the difference between `flutter build apk` and `flutter build appbundle`?

`flutter build apk` produces a universal APK that includes code for all CPU architectures (arm64, x86) — larger file size but can be installed directly on any device. `flutter build appbundle` produces an AAB (Android App Bundle) which Google Play uses to deliver a device-specific, optimized APK at download time — smaller download size for end users. **The Play Store requires AAB** for new app submissions.

---

### Q18: What is the exact lifecycle/flow when a React Native JavaScript function calls a Native API (New Architecture)?

To understand how React Native executes a native call (e.g., triggering a vibration, fetching device info, or launching a native activity), we can trace a call step-by-step from the **TypeScript Component** through **Hermes Bytecode** to **C++ JSI**, and finally to the **Native Android/iOS SDKs**.

#### Step 1: The React / TypeScript Call
In your React code, you make a function call to a TurboModule (a type-safe native module):

```typescript
import NativeVibrationSpec from './NativeVibrationSpec';

function handlePress() {
  // Initiates the native call
  NativeVibrationSpec.vibrate(500); 
}
```

#### Step 2: Bundling & Hermes Bytecode Compilation (`.hbc`)
When you build the app, Metro bundles the JavaScript, and the **Hermes Compiler** compiles the JS AST into optimized **Hermes Bytecode (HBC)**. 

At the assembly/bytecode level, the call is translated into a sequence of VM instructions. Instead of parsing string-based JavaScript at runtime, Hermes registers the method calls directly into registers:

```assembly
; Simulated Hermes Bytecode (HBC) Assembly representing the call
; Load the global/module reference into register r1
GetGlobalObject    r1
; Retrieve the 'NativeVibrationSpec' TurboModule reference
GetById            r2, r1, "NativeVibrationSpec"
; Retrieve the 'vibrate' method
GetById            r3, r2, "vibrate"
; Call the method with a parameter (500ms) stored in r4
Call3              r0, r3, r2, r4
```

#### Step 3: C++ Runtime Execution (JSI)
When the app starts, the C++ React Native engine uses the **JavaScript Interface (JSI)** to inject native modules directly into the JavaScript global runtime environment.
* `NativeVibrationSpec` is not a traditional JS object; it is a **JSI Host Object** implemented in C++ (`facebook::jsi::HostObject`).
* The `vibrate` property is represented as a C++ **Host Function** (`facebook::jsi::Function`).

When the Hermes VM encounters the `Call3` instruction, it executes the registered C++ callback function:

```cpp
// Simulated React Native C++ Engine (JSI Bridge)
jsi::Value vibrateHostFunction(
    jsi::Runtime& rt,
    const jsi::Value& thisVal,
    const jsi::Value* args,
    size_t count
) {
    // 1. Extract parameters directly from the JSI arguments array
    double durationMs = args[0].asNumber();

    // 2. Invoke the auto-generated TurboModule helper 
    // (This uses JNI on Android or Objective-C messaging on iOS)
    vibrateNativeCall(durationMs);

    return jsi::Value::undefined();
}
```

#### Step 4: The Native OS Execution
* **On Android (Kotlin/Java via JNI)**: The C++ runtime calls a Java Method signature via **Java Native Interface (JNI)**:
  ```kotlin
  // Kotlin Native Module Implementation (Android)
  @ReactMethod
  fun vibrate(duration: Double) {
      val vibrator = reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
      vibrator.vibrate(VibrationEffect.createOneShot(duration.toLong(), VibrationEffect.DEFAULT_AMPLITUDE))
  }
  ```
* **On iOS (C++/Objective-C++)**: Because iOS supports C++ directly, the C++ Host Function invokes the Swift/Objective-C method inline without any JNI layer:
  ```objc
  // Objective-C Implementation (iOS)
  RCT_EXPORT_METHOD(vibrate:(double)duration) {
      AudioServicesPlaySystemSound(kSystemSoundID_Vibrate);
  }
  ```

---

### Q19: What is the detailed execution lifecycle of UI interactions (e.g., Typing in a TextInput & Pressing a Button) in the New Architecture (Fabric & Yoga)?

Unlike API calls (TurboModules), UI elements in React Native use **Fabric** (the C++ rendering engine) and **Yoga** (the layout engine). Here is how user input flows from the native screen to React, and how UI updates flow back to the screen.

#### Step 1: The UI Code (React / TS)
We have a text field that updates state and a button that submits it:

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function SearchScreen() {
  const [text, setText] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <TextInput 
        value={text} 
        onChangeText={(val) => setText(val)} 
        placeholder="Type here..." 
      />
      <Button title="Submit" onPress={() => console.log('Submitted:', text)} />
    </View>
  );
}
```

---

#### Step 2: The Event Flow (User types a key -> JS state updates)

When a user taps a key on the virtual keyboard to type a letter (e.g., `'a'`), the flow is **Native -> C++ JSI -> JavaScript**:

1. **OS Capture**: The Android OS captures the hardware touch event on the native screen widget (`android.widget.EditText`).
2. **Fabric EventBeat**: Fabric's C++ layer holds an **EventBeat** (a listener running on native UI run-loops). It detects the text change immediately.
3. **Direct JSI Execution**: Instead of serializing the event to a JSON string over the old bridge, the C++ event listener directly invokes the JSI method representing JavaScript's `onChangeText` callback:
   ```cpp
   // Simulated C++ Fabric Event Dispatcher
   void dispatchTextChange(jsi::Runtime& rt, jsi::Function& jsCallback, std::string newText) {
       // Direct synchronous invocation of the JS callback with the typed text
       jsCallback.call(rt, jsi::String::createFromUtf8(rt, newText));
   }
   ```
4. **JS React Engine**: The JavaScript engine receives the call, updates the state `text` via `setText('a')`, and triggers a React render pass.

---

#### Step 3: The Rendering Flow (JS render -> Native layout updates)

Once React state updates, the rendering flow is **JavaScript -> C++ Shadow Tree (Yoga) -> Native UI**:

```
[JS React Render]
       │  (Generates new React Element Tree)
       ▼
[C++ Fabric Shadow Tree]
       │  (Yoga calculates sizes/flexbox positions)
       ▼
[C++ UI Manager (Commit)]
       │  (Diffs changes and creates tree modifications)
       ▼
[Native OS Main Thread (Mount)]
       │  (Mutates Native Views: Android TextView / iOS UILabel)
       ▼
  [Device Screen]
```

1. **JS Virtual Tree**: React runs the render function and produces a new hierarchy of React elements representing the updated UI.
2. **C++ Shadow Tree creation**: React Native's renderer (Fabric) builds a corresponding **Shadow Tree** in C++. This is an immutable C++ representation of your layout components.
3. **Yoga Layout Calculation**: Fabric passes the Shadow Tree to **Yoga** (the C++ layout engine). Yoga runs Flexbox algorithms to compute precise pixel widths, heights, margins, and absolute offsets (e.g., `left: 20, top: 104`).
4. **Committing Changes**: Fabric diffs the old C++ Shadow Tree with the new one. It compiles a minimal set of instructions (e.g., `UPDATE_TEXT`, `CREATE_VIEW`).
5. **Mounting on Native Main Thread**: 
   * **On Android**: Fabric passes these instructions to the Android OS Main (UI) Thread. The native runner executes `TextView.setText("a")` and repositions elements.
   * **On iOS**: The layout updates are committed directly into native CoreAnimation layers or `UIView` subviews.
6. **Visual Refresh**: The screen updates, showing the letter `'a'` in the input box.

---

*End of document. Last updated: June 2026. Sections: Build & Compilation · Runtime · RN Architecture · Flutter Architecture · Native Bridges · RN Commands · Flutter Commands · Java/Gradle Fixes · Common Build Errors · Cross-Platform · Limitations · Error Handling · State Management · Hot Reload · Navigation · Interview Q&A*