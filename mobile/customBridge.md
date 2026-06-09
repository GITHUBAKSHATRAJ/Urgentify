# Understanding React Native Codegen & The "Bridge"

The errors you saw earlier mentioned `codegen/jni/`. It's natural to wonder: *Am I using codegen? What is it building a bridge for?* 

Here is a breakdown of what React Native Codegen is doing under the hood, and how it relates to the Native Bridge.

## 1. The Old Architecture: The Asynchronous "Bridge"
Historically, React Native used a "Bridge" to communicate between JavaScript and Native (Java/Kotlin on Android, Objective-C/Swift on iOS). 
- Every time JS wanted to tell Native to do something, it serialized the data into a JSON string.
- The string was sent over the Bridge asynchronously.
- Native deserialized the JSON and executed the action.

**The Problem:** This was slow, asynchronous, and lacked type safety.

## 2. The New Architecture: JSI (JavaScript Interface)
React Native has introduced a "New Architecture" which removes the old JSON Bridge entirely. Instead, it uses **JSI (JavaScript Interface)**.
- JSI allows JavaScript to hold references to C++ host objects and invoke their methods **directly and synchronously**.
- No more JSON serialization/deserialization.
- It is much faster and allows for true synchronous calls from JS to Native.

## 3. Where "Codegen" Fits In
Writing JSI C++ code by hand is extremely difficult, verbose, and error-prone. This is why React Native created **Codegen**.

Codegen is a build tool that runs automatically when you compile your app. 
1. It looks at your TypeScript (or Flow) interfaces for Native Modules (TurboModules) and UI Components (Fabric).
2. It **automatically generates all the C++ JSI boilerplate code** needed to connect your JavaScript to your Java/Kotlin/Swift code.

### Why does your app use it?
Even if *you* haven't written any custom native code yourself, third-party libraries you use (like `react-native-reanimated`, `react-native-screens`, and `@react-native-community/datetimepicker`) are built using the New Architecture.
When you run `npm run android`, Gradle triggers Codegen to generate the necessary C++ files for these libraries so they can communicate synchronously with JSI. 

The CMake error you saw earlier happened because the build system was looking for these auto-generated C++ files but couldn't find them in the cache.

## 4. Do you need to build a custom bridge?
**No.** For 99% of React Native development, you do not need to interact with Codegen or write C++ JSI code manually.

If you ever need to write custom Native code (e.g., accessing an Android SDK that doesn't have a React Native library yet), you have two options:
1. **The Hard Way (Codegen/TurboModules):** Write TypeScript specs and let Codegen generate the C++ boilerplate, then implement the Java/Kotlin side.
2. **The Easy Way (Expo Modules API):** Since you are using Expo, you can use the **Expo Modules API**. It automatically handles all the JSI/C++ binding for you without requiring Codegen, allowing you to write pure Swift and Kotlin code instantly.

### Summary
- **You are not writing the bridge yourself.**
- **Codegen** is just a behind-the-scenes tool generating C++ code so that libraries like `reanimated` can run at lightning speed without the old JSON bridge.
