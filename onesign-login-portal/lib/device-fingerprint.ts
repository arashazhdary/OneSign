/**
 * Device Fingerprinting Utility
 * Generates a unique device fingerprint based on browser and system characteristics
 *
 * Collects:
 * - Canvas fingerprint
 * - WebGL renderer info
 * - Audio context fingerprint
 * - Screen resolution and color depth
 * - Timezone and language
 * - Platform and user agent
 * - Installed fonts (basic detection)
 * - Hardware concurrency
 * - Device memory (if available)
 */

interface DeviceFingerprintComponents {
  canvas: string;
  webgl: string;
  audio: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  fonts: string;
  hardware: string;
  plugins: string;
  touchSupport: string;
  colorDepth: string;
  deviceMemory: string;
}

/**
 * Generate canvas fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    canvas.width = 200;
    canvas.height = 50;

    // Draw text with various styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('OneSign Device ID', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device Fingerprint', 4, 17);

    // Draw some shapes
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 25, 20, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
}

/**
 * Generate WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch (e) {
    return 'webgl-error';
  }
}

/**
 * Generate audio context fingerprint
 */
function getAudioFingerprint(): string {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return 'no-audio';

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(0);

    const fingerprint = `${context.sampleRate}-${analyser.fftSize}-${context.state}`;

    oscillator.stop();
    context.close();

    return fingerprint;
  } catch (e) {
    return 'audio-error';
  }
}

/**
 * Get screen information
 */
function getScreenFingerprint(): string {
  const screen = window.screen;
  return `${screen.width}x${screen.height}x${screen.colorDepth}-${screen.availWidth}x${screen.availHeight}`;
}

/**
 * Get timezone information
 */
function getTimezoneFingerprint(): string {
  const offset = new Date().getTimezoneOffset();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `${timezone}-${offset}`;
}

/**
 * Get language information
 */
function getLanguageFingerprint(): string {
  const languages = navigator.languages || [navigator.language];
  return languages.join(',');
}

/**
 * Get platform information
 */
function getPlatformFingerprint(): string {
  return `${navigator.platform}-${navigator.hardwareConcurrency || 'unknown'}`;
}

/**
 * Detect fonts using canvas measurement
 */
function getFontsFingerprint(): string {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Impact', 'Lucida Console'
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'no-fonts';

  const baseSizes: { [key: string]: { width: number; height: number } } = {};
  const detectedFonts: string[] = [];

  // Measure base fonts
  baseFonts.forEach(baseFont => {
    ctx.font = `72px ${baseFont}`;
    const metrics = ctx.measureText('mmmmmmmmmmlli');
    baseSizes[baseFont] = {
      width: metrics.width,
      height: 72
    };
  });

  // Check each test font
  testFonts.forEach(font => {
    let detected = false;
    baseFonts.forEach(baseFont => {
      ctx.font = `72px '${font}', ${baseFont}`;
      const metrics = ctx.measureText('mmmmmmmmmmlli');
      if (metrics.width !== baseSizes[baseFont].width) {
        detected = true;
      }
    });
    if (detected) {
      detectedFonts.push(font);
    }
  });

  return detectedFonts.join(',') || 'no-custom-fonts';
}

/**
 * Get plugins information (deprecated but still useful)
 */
function getPluginsFingerprint(): string {
  const plugins = Array.from(navigator.plugins || [])
    .map(p => p.name)
    .sort()
    .join(',');
  return plugins || 'no-plugins';
}

/**
 * Get touch support information
 */
function getTouchSupport(): string {
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const touchEvent = 'ontouchstart' in window;
  const touchPoints = navigator.maxTouchPoints || (navigator as any).msMaxTouchPoints || 0;
  return `${touchEvent}-${touchPoints}-${maxTouchPoints}`;
}

/**
 * Get device memory (if available)
 */
function getDeviceMemory(): string {
  const memory = (navigator as any).deviceMemory;
  return memory ? `${memory}GB` : 'unknown';
}

/**
 * Simple hash function (FNV-1a)
 */
function hashString(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Generate complete device fingerprint
 */
export async function generateDeviceFingerprint(): Promise<string> {
  try {
    const components: DeviceFingerprintComponents = {
      canvas: getCanvasFingerprint(),
      webgl: getWebGLFingerprint(),
      audio: getAudioFingerprint(),
      screen: getScreenFingerprint(),
      timezone: getTimezoneFingerprint(),
      language: getLanguageFingerprint(),
      platform: getPlatformFingerprint(),
      userAgent: navigator.userAgent,
      fonts: getFontsFingerprint(),
      hardware: `${navigator.hardwareConcurrency || 'unknown'}`,
      plugins: getPluginsFingerprint(),
      touchSupport: getTouchSupport(),
      colorDepth: `${window.screen.colorDepth}`,
      deviceMemory: getDeviceMemory(),
    };

    // Combine all components into a single string
    const fingerprintString = Object.entries(components)
      .map(([key, value]) => `${key}:${value}`)
      .join('|');

    // Hash the fingerprint string for privacy and consistency
    const hash = hashString(fingerprintString);

    // Return a prefixed hash for easy identification
    return `fp_${hash}`;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to a simpler fingerprint
    const fallback = `${navigator.userAgent}-${getScreenFingerprint()}-${getTimezoneFingerprint()}`;
    return `fp_${hashString(fallback)}`;
  }
}

/**
 * Get or create device fingerprint from localStorage
 * This provides consistency across sessions
 */
export async function getDeviceFingerprint(): Promise<string> {
  const STORAGE_KEY = 'onesign_device_fp';

  try {
    // Try to get existing fingerprint from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }

    // Generate new fingerprint
    const fingerprint = await generateDeviceFingerprint();

    // Store for future use
    localStorage.setItem(STORAGE_KEY, fingerprint);

    return fingerprint;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    // If localStorage is not available, just generate without storing
    return await generateDeviceFingerprint();
  }
}

/**
 * Clear stored device fingerprint
 */
export function clearDeviceFingerprint(): void {
  const STORAGE_KEY = 'onesign_device_fp';
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing device fingerprint:', error);
  }
}

/**
 * Check if device is trusted (stored in localStorage)
 */
export function isDeviceTrusted(): boolean {
  const TRUSTED_KEY = 'onesign_trusted_device';
  try {
    return localStorage.getItem(TRUSTED_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Mark device as trusted
 */
export function markDeviceAsTrusted(): void {
  const TRUSTED_KEY = 'onesign_trusted_device';
  try {
    localStorage.setItem(TRUSTED_KEY, 'true');
  } catch (error) {
    console.error('Error marking device as trusted:', error);
  }
}

/**
 * Remove trusted device flag
 */
export function removeTrustedDeviceFlag(): void {
  const TRUSTED_KEY = 'onesign_trusted_device';
  try {
    localStorage.removeItem(TRUSTED_KEY);
  } catch (error) {
    console.error('Error removing trusted device flag:', error);
  }
}
