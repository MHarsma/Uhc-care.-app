/**
 * WebAuthn Biometric & Fingerprint Authentication Utility
 * Supports Native Fingerprint Scanners (Android/Windows Hello) & Touch ID / Face ID (Apple).
 */

export interface BiometricStatus {
  isSupported: boolean;
  isEnrolled: boolean;
  enrolledEmail: string | null;
  hasStoredKey: boolean;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen === 4 ? 0 : padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Check if current browser & device hardware supports biometric platform authenticators */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }

  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) return true;
    }
    return Boolean(window.isSecureContext && window.PublicKeyCredential);
  } catch {
    return Boolean(window.isSecureContext && window.PublicKeyCredential);
  }
}

/** Check enrollment status */
export function getBiometricStatus(): BiometricStatus {
  if (typeof window === "undefined") {
    return { isSupported: false, isEnrolled: false, enrolledEmail: null, hasStoredKey: false };
  }

  const isEnrolled = localStorage.getItem("uhc_biometric_enabled") === "true";
  const enrolledEmail = localStorage.getItem("uhc_biometric_user");
  const hasStoredKey = Boolean(localStorage.getItem("uhc_biometric_token"));

  return {
    isSupported: Boolean(window.PublicKeyCredential && window.isSecureContext),
    isEnrolled: isEnrolled && hasStoredKey,
    enrolledEmail,
    hasStoredKey,
  };
}

/** Enroll device fingerprint / biometrics for the currently logged-in user */
export async function enrollBiometrics(userEmail: string, userName: string): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("Biometric authentication is not supported by your browser or device.");
  }

  // WebAuthn requires a secure context (HTTPS or localhost)
  if (!window.isSecureContext) {
    throw new Error(
      "Fingerprint enrolment requires a secure HTTPS connection. Please access the app over HTTPS."
    );
  }

  const currentAuthToken = localStorage.getItem("uhc_auth_token");
  if (!currentAuthToken) {
    throw new Error(
      "You must be signed in with your email and password to link your fingerprint sensor."
    );
  }

  const randomChallenge = new Uint8Array(32);
  window.crypto.getRandomValues(randomChallenge);

  const userIdBuffer = new TextEncoder().encode(userEmail);

  const hostname = window.location.hostname;
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge: randomChallenge,
    rp: {
      name: "UHC Care Couple OS",
      ...(hostname && !isIpAddress ? { id: hostname } : {}),
    },
    user: {
      id: userIdBuffer,
      name: userEmail,
      displayName: userName || userEmail.split("@")[0],
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }, // ES256
      { alg: -257, type: "public-key" }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Native hardware fingerprint / TouchID / Windows Hello
      userVerification: "preferred", // 'preferred' for maximum device compatibility on Android & iOS
      requireResidentKey: false,
    },
    timeout: 60000,
    attestation: "none",
  };

  let credential: PublicKeyCredential | null = null;
  try {
    credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null;
  } catch (err: any) {
    // If platform authenticator fails, attempt without strict attachment
    if (err?.name === "NotSupportedError" || err?.name === "InvalidStateError") {
      const fallbackOptions: PublicKeyCredentialCreationOptions = {
        ...publicKeyCredentialCreationOptions,
        authenticatorSelection: {
          userVerification: "preferred",
        },
      };
      credential = (await navigator.credentials.create({
        publicKey: fallbackOptions,
      })) as PublicKeyCredential | null;
    } else if (err?.name === "NotAllowedError") {
      throw new Error("Sensor scan was cancelled or timed out. Please tap Enable and place your finger on the sensor.");
    } else {
      throw err;
    }
  }

  if (!credential) {
    throw new Error("Biometric sensor enrollment was cancelled or timed out.");
  }

  // Save successful enrollment metadata and restore key locally
  localStorage.setItem("uhc_biometric_enabled", "true");
  localStorage.setItem("uhc_biometric_cred_id", credential.id);
  if (credential.rawId) {
    localStorage.setItem("uhc_biometric_raw_id", bufferToBase64Url(credential.rawId));
  }
  localStorage.setItem("uhc_biometric_user", userEmail);
  localStorage.setItem("uhc_biometric_token", currentAuthToken);
  localStorage.setItem("uhc_biometric_timestamp", Date.now().toString());

  return true;
}

/** Verify user identity via device fingerprint / biometrics and restore auth token */
export async function verifyBiometrics(): Promise<{ success: boolean; userEmail: string | null; token: string | null }> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("Biometric authentication is not supported on this device.");
  }

  const enrolledCredId = localStorage.getItem("uhc_biometric_raw_id") || localStorage.getItem("uhc_biometric_cred_id");
  const enrolledEmail = localStorage.getItem("uhc_biometric_user");
  const storedToken = localStorage.getItem("uhc_biometric_token");

  if (!enrolledCredId || !storedToken) {
    throw new Error(
      "No fingerprint enrolled on this device yet. Please sign in with password and enable it in Settings."
    );
  }

  const randomChallenge = new Uint8Array(32);
  window.crypto.getRandomValues(randomChallenge);

  const hostname = window.location.hostname;
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  let credIdBytes: Uint8Array | null = null;
  try {
    credIdBytes = base64UrlToUint8Array(enrolledCredId);
  } catch {
    credIdBytes = null;
  }

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: randomChallenge,
    ...(hostname && !isIpAddress ? { rpId: hostname } : {}),
    ...(credIdBytes ? {
      allowCredentials: [
        {
          type: "public-key",
          id: credIdBytes as any,
        },
      ],
    } : {}),
    userVerification: "preferred",
    timeout: 60000,
  };

  let assertion: Credential | null = null;
  try {
    assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });
  } catch (err: any) {
    const msg = String(err?.message || "");
    if (
      err?.name === "NotAllowedError" ||
      msg.includes("not allowed") ||
      msg.includes("timed out") ||
      msg.includes("privacy-considerations")
    ) {
      throw new Error(
        "Sensor prompt was cancelled, timed out, or needs re-linking. Please tap 'Disable Biometrics' then re-enable to sync your fingerprint sensor."
      );
    }
    throw err;
  }

  if (!assertion) {
    throw new Error("Fingerprint verification was cancelled.");
  }

  // Restore authentication tokens
  localStorage.setItem("uhc_auth_token", storedToken);
  localStorage.setItem("uhc_logged_in", "true");

  return {
    success: true,
    userEmail: enrolledEmail,
    token: storedToken,
  };
}

/** Test existing enrolled biometrics without logging out */
export async function testBiometrics(): Promise<boolean> {
  const result = await verifyBiometrics();
  return result.success;
}

/** Disable and clear stored biometric profile */
export function removeBiometrics(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("uhc_biometric_enabled");
  localStorage.removeItem("uhc_biometric_cred_id");
  localStorage.removeItem("uhc_biometric_raw_id");
  localStorage.removeItem("uhc_biometric_user");
  localStorage.removeItem("uhc_biometric_token");
  localStorage.removeItem("uhc_biometric_timestamp");
}
