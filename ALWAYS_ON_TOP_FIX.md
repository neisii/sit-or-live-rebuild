# Always On Top Feature Fix

**Date**: November 27, 2025  
**Issue**: Always on Top checkbox doesn't work  
**Status**: 🔧 Debugging

---

## Changes Made

### 1. Added Better Logging

**File**: `src/components/SettingsPanel.tsx`

```typescript
const handleAlwaysOnTopToggle = async () => {
  const newValue = !alwaysOnTop;
  console.log('Toggling always on top to:', newValue);
  
  try {
    await setAlwaysOnTop(newValue);
    onAlwaysOnTopChange(newValue);
    console.log('Always on top toggled successfully');
  } catch (error) {
    console.error('Failed to toggle always on top:', error);
    alert('Failed to toggle always on top: ' + error);
  }
};
```

### 2. Simplified Implementation

**File**: `src/services/settingsService.ts`

```typescript
export async function setAlwaysOnTop(enabled: boolean): Promise<void> {
  try {
    const window = getCurrentWindow();
    await window.setAlwaysOnTop(enabled);
    updateSetting('alwaysOnTop', enabled);
    console.log('Always on top set to:', enabled);
  } catch (error) {
    console.error('Failed to set always on top:', error);
    throw new Error('Failed to set always on top');
  }
}
```

---

## Testing Steps

### 1. Restart the App

```bash
# Stop the current dev server (Ctrl+C)
# Then restart
npm run tauri:dev
```

### 2. Open Developer Console

In the app, press:
- **macOS**: `Cmd + Option + I`
- Or right-click → Inspect Element

### 3. Test the Feature

1. Open Settings (⚙️ button)
2. Go to General tab
3. Check the "Always on Top" checkbox
4. Watch the console for logs:
   ```
   Toggling always on top to: true
   Always on top set to: true
   Always on top toggled successfully
   ```

### 4. Verify Behavior

- Try clicking on another app (Finder, Chrome, etc.)
- The Sit or Live window should stay on top
- If it doesn't, check console for errors

---

## Possible Issues

### Issue 1: Tauri API Not Available

**Symptom**: Error in console: "getCurrentWindow is not a function"

**Solution**: Make sure you're running in Tauri context:
```bash
npm run tauri:dev  # NOT npm run dev
```

### Issue 2: Window Permissions

**Symptom**: No error but window doesn't stay on top

**Solution**: macOS might need permissions. Check:
- System Preferences → Security & Privacy → Privacy → Accessibility
- Grant permissions to the app

### Issue 3: Development vs Production

**Symptom**: Works in dev but not in production build

**Solution**: Rebuild the app:
```bash
npm run tauri:build
```

---

## How It Should Work

1. **User clicks checkbox** → Calls `handleAlwaysOnTopToggle()`
2. **Handler calls** → `setAlwaysOnTop(!alwaysOnTop)`
3. **Service calls** → `window.setAlwaysOnTop(enabled)`
4. **Tauri API** → Sets macOS window level
5. **State updates** → `onAlwaysOnTopChange(newValue)`
6. **Checkbox reflects** → New state

---

## Debugging Commands

### Check if Tauri API is available

Open console and run:
```javascript
// Check if window API exists
console.log(window.__TAURI__);

// Try to get current window
const { getCurrentWindow } = window.__TAURI__.window;
const win = getCurrentWindow();
console.log('Window:', win);

// Try to set always on top
win.setAlwaysOnTop(true).then(() => {
  console.log('Success!');
}).catch(err => {
  console.error('Error:', err);
});
```

### Check localStorage

```javascript
// Check if setting is saved
console.log(localStorage.getItem('app_settings'));
```

---

## Next Steps

1. **Restart the app** with `npm run tauri:dev`
2. **Open console** (Cmd + Option + I)
3. **Toggle checkbox** and watch for logs
4. **Report back** what you see in the console

If you see errors, please share:
- The exact error message
- Any console logs
- Whether you're running dev or production build

---

**Status**: 🔧 Awaiting Test Results  
**Last Updated**: November 27, 2025
