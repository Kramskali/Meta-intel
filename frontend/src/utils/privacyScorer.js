// Privacy Score Calculator - rates metadata exposure on 0-100 scale

export const calculatePrivacyScore = (metadata) => {
  let score = 100;
  const issues = [];

  // Browser fingerprinting risks (-25 points max)
  if (metadata.browser) {
    if (metadata.browser.cookiesEnabled) score -= 3;
    if (metadata.browser.doNotTrack === 'null' || metadata.browser.doNotTrack === null) {
      score -= 5;
      issues.push({ severity: 'medium', category: 'Browser', issue: 'Do Not Track is disabled', recommendation: 'Enable Do Not Track in browser settings' });
    }
    if (metadata.browser.deviceMemory && metadata.browser.deviceMemory > 4) {
      score -= 3;
      issues.push({ severity: 'low', category: 'Browser', issue: 'Device memory exposed', recommendation: 'This reveals your hardware capacity' });
    }
    if (metadata.browser.hardwareConcurrency && metadata.browser.hardwareConcurrency > 4) {
      score -= 3;
      issues.push({ severity: 'low', category: 'Browser', issue: 'CPU cores exposed', recommendation: 'Unique hardware signature detected' });
    }
  }

  // Device fingerprinting risks (-20 points max)
  if (metadata.device) {
    if (metadata.device.devicePixelRatio !== 1) {
      score -= 4;
      issues.push({ severity: 'low', category: 'Device', issue: 'High-DPI display detected', recommendation: 'Unique display configuration' });
    }
    const screenSize = metadata.device.screenWidth * metadata.device.screenHeight;
    if (screenSize > 2073600) { // 1920x1080
      score -= 3;
      issues.push({ severity: 'low', category: 'Device', issue: 'Uncommon screen resolution', recommendation: 'Your screen size is trackable' });
    }
  }

  // Hidden fingerprinting data (-30 points max)
  if (metadata.hidden) {
    if (metadata.hidden.canvasFingerprint && metadata.hidden.canvasFingerprint !== 'N/A') {
      score -= 10;
      issues.push({ severity: 'high', category: 'Fingerprinting', issue: 'Canvas fingerprint exposed', recommendation: 'Use privacy-focused browsers to block canvas fingerprinting' });
    }
    if (metadata.hidden.webglFingerprint && typeof metadata.hidden.webglFingerprint === 'object') {
      score -= 10;
      issues.push({ severity: 'high', category: 'Fingerprinting', issue: 'WebGL/GPU information exposed', recommendation: 'Your graphics card can be uniquely identified' });
    }
    if (metadata.hidden.installedFonts && metadata.hidden.installedFonts.length > 5) {
      score -= 8;
      issues.push({ severity: 'high', category: 'Fingerprinting', issue: `${metadata.hidden.installedFonts.length} system fonts detected`, recommendation: 'Font detection creates unique fingerprint' });
    }
    if (metadata.hidden.battery && typeof metadata.hidden.battery === 'object') {
      score -= 2;
      issues.push({ severity: 'low', category: 'Fingerprinting', issue: 'Battery status exposed', recommendation: 'Battery level can be used for tracking' });
    }
  }

  // Permission risks (-15 points max)
  if (metadata.permissions) {
    const grantedPermissions = Object.entries(metadata.permissions).filter(
      ([key, value]) => value === 'granted'
    );
    const permissionPenalty = Math.min(grantedPermissions.length * 3, 15);
    score -= permissionPenalty;
    if (grantedPermissions.length > 0) {
      issues.push({
        severity: 'medium',
        category: 'Permissions',
        issue: `${grantedPermissions.length} permissions granted`,
        recommendation: 'Review and revoke unnecessary permissions'
      });
    }
  }

  // Storage tracking (-10 points max)
  if (metadata.storage) {
    if (metadata.storage.localStorageEnabled) {
      score -= 3;
    }
    if (metadata.storage.indexedDBSupported) {
      score -= 2;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    grade: getPrivacyGrade(score),
    issues,
    summary: getScoreSummary(score)
  };
};

const getPrivacyGrade = (score) => {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
};

const getScoreSummary = (score) => {
  if (score >= 80) return 'Excellent privacy protection. Your fingerprint is difficult to track.';
  if (score >= 65) return 'Good privacy. Some identifying information is exposed.';
  if (score >= 50) return 'Moderate privacy. Multiple tracking vectors detected.';
  if (score >= 35) return 'Poor privacy. High fingerprinting risk.';
  return 'Critical. Your device is highly trackable across websites.';
};
