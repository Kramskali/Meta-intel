// Comprehensive metadata collection utility

export const collectBrowserMetadata = () => {
  const nav = window.navigator;
  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    languages: nav.languages || [],
    vendor: nav.vendor,
    cookiesEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    onLine: nav.onLine,
    hardwareConcurrency: nav.hardwareConcurrency || 'N/A',
    deviceMemory: nav.deviceMemory || 'N/A',
    maxTouchPoints: nav.maxTouchPoints || 0,
    pdfViewerEnabled: nav.pdfViewerEnabled || false,
  };
};

export const collectDeviceMetadata = () => {
  const screen = window.screen;
  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    orientation: screen.orientation?.type || 'N/A',
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    devicePixelRatio: window.devicePixelRatio,
  };
};

export const collectNetworkMetadata = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    effectiveType: connection?.effectiveType || 'N/A',
    downlink: connection?.downlink || 'N/A',
    rtt: connection?.rtt || 'N/A',
    saveData: connection?.saveData || false,
    type: connection?.type || 'N/A',
  };
};

export const collectStorageMetadata = () => {
  const getStorageSize = (storage) => {
    try {
      let size = 0;
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          size += storage[key].length + key.length;
        }
      }
      return size;
    } catch (e) {
      return 0;
    }
  };

  return {
    localStorageEnabled: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    sessionStorageEnabled: (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    localStorageSize: getStorageSize(localStorage) + ' bytes',
    sessionStorageSize: getStorageSize(sessionStorage) + ' bytes',
    indexedDBSupported: !!window.indexedDB,
  };
};

export const collectPermissionsMetadata = async () => {
  const permissions = {};
  const permissionNames = [
    'geolocation',
    'notifications',
    'camera',
    'microphone',
    'clipboard-read',
    'clipboard-write',
  ];

  for (const name of permissionNames) {
    try {
      const result = await navigator.permissions.query({ name });
      permissions[name] = result.state;
    } catch (e) {
      permissions[name] = 'not supported';
    }
  }

  return permissions;
};

export const collectHiddenMetadata = () => {
  // Canvas Fingerprint
  const getCanvasFingerprint = () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device Fingerprint', 4, 17);
      const dataURL = canvas.toDataURL();
      return dataURL.substring(dataURL.length - 50);
    } catch (e) {
      return 'N/A';
    }
  };

  // WebGL Fingerprint
  const getWebGLFingerprint = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'N/A';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    } catch (e) {
      return 'N/A';
    }
  };

  // Fonts Detection
  const detectFonts = () => {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
      'Impact'
    ];
    
    const detected = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    baseFonts.forEach(baseFont => {
      ctx.font = `72px ${baseFont}`;
      const baseWidth = ctx.measureText('mmmmmmmmmmlli').width;
      
      testFonts.forEach(testFont => {
        ctx.font = `72px ${testFont}, ${baseFont}`;
        const testWidth = ctx.measureText('mmmmmmmmmmlli').width;
        if (testWidth !== baseWidth) {
          if (!detected.includes(testFont)) {
            detected.push(testFont);
          }
        }
      });
    });
    
    return detected;
  };

  // Battery API
  const getBatteryInfo = async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return {
          charging: battery.charging,
          level: Math.round(battery.level * 100) + '%',
          chargingTime: battery.chargingTime === Infinity ? 'N/A' : battery.chargingTime,
          dischargingTime: battery.dischargingTime === Infinity ? 'N/A' : battery.dischargingTime,
        };
      }
      return 'Not supported';
    } catch (e) {
      return 'Not supported';
    }
  };

  return {
    canvasFingerprint: getCanvasFingerprint(),
    webglFingerprint: getWebGLFingerprint(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    plugins: Array.from(navigator.plugins || []).map(p => p.name),
    mimeTypes: Array.from(navigator.mimeTypes || []).map(m => m.type),
    installedFonts: detectFonts(),
  };
};

export const collectTimeMetadata = () => {
  return {
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleString(),
    utcTime: new Date().toUTCString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export const collectAllMetadata = async () => {
  const browser = collectBrowserMetadata();
  const device = collectDeviceMetadata();
  const network = collectNetworkMetadata();
  const storage = collectStorageMetadata();
  const permissions = await collectPermissionsMetadata();
  const hidden = collectHiddenMetadata();
  const time = collectTimeMetadata();

  // Get battery info separately as it's async
  let battery = 'Not supported';
  try {
    if ('getBattery' in navigator) {
      const bat = await navigator.getBattery();
      battery = {
        charging: bat.charging,
        level: Math.round(bat.level * 100) + '%',
        chargingTime: bat.chargingTime === Infinity ? 'N/A' : bat.chargingTime + 's',
        dischargingTime: bat.dischargingTime === Infinity ? 'N/A' : bat.dischargingTime + 's',
      };
    }
  } catch (e) {
    battery = 'Not supported';
  }

  return {
    browser,
    device,
    network,
    storage,
    permissions,
    hidden: { ...hidden, battery },
    time,
  };
};

export const getMetadataExplanations = () => {
  return {
    browser: {
      userAgent: 'Identifies your browser, OS, and device type. Used for compatibility and analytics.',
      platform: 'Operating system platform. Used for OS-specific optimizations.',
      language: 'Browser language preference. Used for localization.',
      vendor: 'Browser vendor/manufacturer.',
      cookiesEnabled: 'Whether cookies are enabled. Essential for session management.',
      doNotTrack: 'Your tracking preference signal. Not always respected by websites.',
      hardwareConcurrency: 'Number of CPU cores. Can be used for fingerprinting.',
      deviceMemory: 'Approximate RAM in GB. Can be used for fingerprinting.',
    },
    device: {
      screenWidth: 'Monitor/screen width in pixels. Used for responsive design and fingerprinting.',
      screenHeight: 'Monitor/screen height in pixels. Used for responsive design and fingerprinting.',
      colorDepth: 'Color bit depth. Part of device fingerprint.',
      devicePixelRatio: 'Pixel density. Used for high-DPI displays and fingerprinting.',
      orientation: 'Screen orientation. Used for mobile responsiveness.',
    },
    network: {
      effectiveType: 'Connection speed (4g, 3g, etc.). Used to optimize content delivery.',
      downlink: 'Download speed in Mbps. Used for adaptive content.',
      rtt: 'Round-trip time in ms. Network latency indicator.',
      saveData: 'Data saver mode status. Used to reduce bandwidth usage.',
    },
    storage: {
      localStorageEnabled: 'Persistent browser storage. Used for preferences and offline data.',
      sessionStorageEnabled: 'Temporary session storage. Cleared when tab closes.',
      indexedDBSupported: 'Advanced client-side database. Used for complex offline apps.',
    },
    permissions: {
      geolocation: 'Access to your physical location. Used for location-based services.',
      notifications: 'Ability to send browser notifications.',
      camera: 'Access to camera. Used for video calls, photos.',
      microphone: 'Access to microphone. Used for voice input, calls.',
      'clipboard-read': 'Read clipboard content. Privacy sensitive.',
      'clipboard-write': 'Write to clipboard. Less sensitive than read.',
    },
    hidden: {
      canvasFingerprint: 'Unique rendering signature. Used for device fingerprinting.',
      webglFingerprint: 'GPU identification. Strong fingerprinting signal.',
      timezone: 'Your timezone. Can reveal approximate location.',
      plugins: 'Installed browser plugins. Part of fingerprint.',
      installedFonts: 'System fonts. Strong fingerprinting signal.',
      battery: 'Battery status. Can be used for tracking.',
    },
  };
};
