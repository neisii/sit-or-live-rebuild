# iTerm2 Theme Fix

**Date**: November 27, 2025  
**Issue**: Dynamic profile missing Guid field  
**Status**: ✅ Fixed

## Problem

iTerm2 was showing error:
```
Dynamic profile is missing the Guid field in file 
/Users/neisii/Library/Application Support/iTerm2/DynamicProfiles/sit-or-live.json
```

## Root Cause

The theme generation script (`scripts/generate-theme-presets.cjs`) was not including 
the required `Guid` field in iTerm2 dynamic profiles.

## Solution

Updated `generateITerm2Theme()` function to:
1. Generate consistent GUID using MD5 hash of theme ID
2. Format as proper UUID (8-4-4-4-12 format)
3. Include in profile JSON

## Changes Made

**File**: `scripts/generate-theme-presets.cjs`
- Added crypto-based GUID generation
- Each theme gets unique, consistent GUID
- Example: `AFEF6F92-1762-5970-65C6-010790E3C368`

**Regenerated**: All 6 iTerm2 theme files
**Rebuilt**: Rust backend with updated embedded themes

## Verification

All iTerm2 themes now include Guid field:
- ✅ daylight-survivor.json
- ✅ vampire-night.json
- ✅ silent-hill.json
- ✅ rainy-cemetery.json
- ✅ frozen-dead.json
- ✅ frankenstein-lab.json

## Testing

Run the app and change themes - iTerm2 should now accept the dynamic profiles 
without errors.
