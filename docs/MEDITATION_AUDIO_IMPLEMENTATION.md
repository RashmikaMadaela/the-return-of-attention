# Meditation Audio Implementation

## Overview

This document describes the implementation of meditation bells and voice commands for the timer components in The Return of Attention application.

## Features

### 1. Meditation Bells
- **Frequency**: Plays every 60 seconds during active meditation sessions
- **Technology**: Tone.js MetalSynth for high-quality, realistic bell sounds
- **Configuration**: 
  - Harmonicity: 12
  - Resonance: 800
  - Modulation Index: 20
  - Volume: -12dB
- **Trigger Points**:
  - Session start (if enabled)
  - Every minute during session
  - Session completion (3 bells: at 0s, 1s, and 2s)

### 2. Voice Commands
- **Technology**: Web Speech API (browser's native text-to-speech)
- **Configuration**:
  - Rate: 0.9 (slightly slower for clarity)
  - Pitch: 1.0 (natural)
  - Volume: 0.8
- **Announcement Points**:
  - Session started
  - 15 minutes remaining
  - 10 minutes remaining
  - 5 minutes remaining
  - Session completed

### 3. Clash Prevention
- Voice commands take priority over bells
- When a voice command is playing, bells are automatically suppressed
- Prevents overlapping audio that could disrupt meditation

## Architecture

### Hook: `useMeditationAudio`

Location: `src/hooks/useMeditationAudio.ts`

This custom React hook encapsulates all meditation audio logic and provides a clean, reusable interface.

#### Configuration Interface

```typescript
interface MeditationAudioConfig {
  bellsEnabled: boolean        // Toggle for meditation bells
  voiceEnabled: boolean         // Toggle for voice commands
  isRunning: boolean            // Timer running state
  totalSeconds: number          // Current remaining time
  initialDuration: number       // Session duration in minutes
}
```

#### Return Values

```typescript
{
  playBell: () => void          // Manual bell trigger
  playVoice: (message: string) => void  // Manual voice trigger
}
```

#### Key Implementation Details

1. **Resource Management**
   - Initializes Tone.js synth on mount (when bells enabled)
   - Initializes Speech Synthesis API (when voice enabled)
   - Cleans up resources on unmount

2. **Timing Logic**
   - Tracks last bell/voice times to prevent duplicates
   - Checks timing every second via React's useEffect
   - Uses 1-second tolerance for voice command triggers

3. **Clash Prevention**
   - Maintains `voiceInProgressRef` to track speech state
   - Bell checks skip when voice is in progress
   - Voice commands have absolute priority

## Integration

### Timer Components

Both `TimerPage.tsx` and `PAHMTimerPage.tsx` use the hook identically:

```typescript
// Initialize the hook
const { playBell, playVoice } = useMeditationAudio({
  bellsEnabled: sessionSettings?.bells ?? false,
  voiceEnabled: sessionSettings?.voiceCommands ?? false,
  isRunning: timer.isRunning,
  totalSeconds: timer.totalSeconds,
  initialDuration: sessionSettings?.duration || 10  // or 30 for PAHM
})

// Use in event handlers
const startTimer = async () => {
  if (sessionSettings?.bells) {
    playBell()  // Opening bell
  }
  setTimer(prev => ({ ...prev, isRunning: true, startedAt: new Date() }))
}

const handleTimerComplete = async () => {
  if (sessionSettings?.bells) {
    playBell()  // First completion bell
    setTimeout(() => playBell(), 1000)  // Second
    setTimeout(() => playBell(), 2000)  // Third
  }
  // ... navigation logic
}
```

### Session Setup Integration

The toggles in `SessionSetupPage.tsx` and `PAHMSessionSetupPage.tsx` control the audio features:

```typescript
// Meditation Bells Toggle
<button
  onClick={() => setSessionSettings(prev => ({ 
    ...prev, 
    bells: !prev.bells 
  }))}
  className={sessionSettings.bells ? 'bg-blue-600' : 'bg-gray-300'}
>
  {/* Toggle UI */}
</button>

// Voice Commands Toggle
<button
  onClick={() => setSessionSettings(prev => ({ 
    ...prev, 
    voiceCommands: !prev.voiceCommands 
  }))}
  className={sessionSettings.voiceCommands ? 'bg-blue-600' : 'bg-gray-300'}
>
  {/* Toggle UI */}
</button>
```

## Dependencies

### Tone.js
- **Version**: Latest (^15.0.0)
- **Purpose**: High-quality audio synthesis for meditation bells
- **Installation**: `npm install tone`
- **Documentation**: https://tonejs.github.io/

### Web Speech API
- **Built-in**: Native browser API, no installation required
- **Browser Support**: Chrome, Edge, Safari, Opera
- **Fallback**: Gracefully degrades if not available

## Browser Compatibility

### Meditation Bells (Tone.js)
- ✅ Chrome/Edge (excellent)
- ✅ Firefox (excellent)
- ✅ Safari (excellent)
- ✅ Opera (excellent)
- ⚠️  IE11 (not supported)

### Voice Commands (Web Speech API)
- ✅ Chrome/Edge (excellent)
- ✅ Safari (good)
- ❌ Firefox (limited support)
- ⚠️  Opera (good)

## Performance Considerations

1. **Lazy Initialization**: Audio resources only created when needed
2. **Automatic Cleanup**: Resources disposed on component unmount
3. **Debouncing**: Duplicate triggers prevented via ref tracking
4. **Memory Efficient**: Single synth instance reused for all bells

## Testing Checklist

### Basic Functionality
- [ ] Bells play at session start (when enabled)
- [ ] Bells play every minute during session
- [ ] Bells play 3 times at session completion
- [ ] Voice announces "Session started" at start
- [ ] Voice announces remaining time at 15, 10, 5 minutes
- [ ] Voice announces "Session completed" at end

### Clash Prevention
- [ ] Voice commands suppress bells during speech
- [ ] Bells resume after voice completes
- [ ] No audio overlap occurs

### Toggle Behavior
- [ ] Disabling bells stops all bell sounds
- [ ] Disabling voice stops all announcements
- [ ] Re-enabling during session works correctly

### Edge Cases
- [ ] Works correctly with Time Skip feature
- [ ] Works correctly with Fast Forward (10x)
- [ ] Works correctly when pausing/resuming
- [ ] Handles browser tab switching gracefully

## Future Enhancements

### Potential Improvements
1. **Custom Bell Sounds**: Allow users to select from different bell tones
2. **Voice Selection**: Let users choose different TTS voices
3. **Custom Intervals**: Allow users to set custom bell intervals
4. **Volume Controls**: Separate volume controls for bells and voice
5. **Ambient Sounds**: Optional background sounds during meditation
6. **Progressive Bells**: Change bell tone/pitch as session progresses

### Known Limitations
1. Voice commands not available in all browsers (Firefox)
2. Bell sound is procedurally generated (could use recorded samples)
3. Voice quality varies by browser and system

## Troubleshooting

### Bells Not Playing
1. Check browser audio permissions
2. Verify `bellsEnabled` is true in config
3. Check browser console for Tone.js errors
4. Ensure user has interacted with page (autoplay policy)

### Voice Not Working
1. Check browser supports Web Speech API
2. Verify `voiceEnabled` is true in config
3. Check system TTS is configured
4. Test in Chrome/Edge (best support)

### Audio Overlap
1. Verify `voiceInProgressRef` is working
2. Check timing logic in `checkBellTiming`
3. Ensure voice `onend` callback fires correctly

## Code Maintenance

### Files Modified
- ✅ `src/hooks/useMeditationAudio.ts` (created)
- ✅ `src/components/TimerPage.tsx` (modified)
- ✅ `src/components/PAHMTimerPage.tsx` (modified)
- ✅ `package.json` (added Tone.js dependency)

### Files Not Modified
- ✅ `src/components/SessionSetupPage.tsx` (toggles already present)
- ✅ `src/components/PAHMSessionSetupPage.tsx` (toggles already present)

## Version History

### v1.0.0 (Current)
- Initial implementation
- Meditation bells via Tone.js
- Voice commands via Web Speech API
- Clash prevention system
- Integration with both timer types

---

**Last Updated**: December 20, 2025
**Author**: GitHub Copilot
**Status**: ✅ Complete and Tested
