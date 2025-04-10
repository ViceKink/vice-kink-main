
# Tech Stack

## Core Technologies

- **Framework**: Expo with React Native
- **Language**: TypeScript
- **Backend**: Supabase (existing instance)
- **State Management**: React Query with Zustand
- **UI Components**: Native Base or React Native Paper
- **Navigation**: React Navigation
- **Forms**: React Hook Form with Zod validation

## Essential Packages

```json
{
  "dependencies": {
    "@react-navigation/native": "latest",
    "@react-navigation/stack": "latest",
    "@react-navigation/bottom-tabs": "latest",
    "@supabase/supabase-js": "latest",
    "@tanstack/react-query": "latest",
    "react-hook-form": "latest",
    "zustand": "latest",
    "zod": "latest",
    "expo": "latest",
    "expo-image-picker": "latest",
    "expo-location": "latest",
    "expo-secure-store": "latest",
    "expo-status-bar": "latest",
    "date-fns": "latest"
  }
}
```

## Supabase Configuration

```typescript
// Example configuration for Supabase connection
const supabaseUrl = "https://qgdacrkeafssldlxmajm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZGFjcmtlYWZzc2xkbHhtYWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Mzk4MTEsImV4cCI6MjA1ODMxNTgxMX0.mA3mj9HpoykT0jVmt7IgVHItcHIjiCkw3iI4Ra6urrA";
```
