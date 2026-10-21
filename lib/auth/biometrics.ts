/**
 * WebAuthn Biometric & Fingerprint Authentication Utility
 * Supports Native Fingerprint Scanners (Android/Windows Hello) & Touch ID / Face ID (Apple).
 */

export interface BiometricStatus {
  isSupported: boolean;
  isEnrolled: boolean;
  enrolledEmail: string | null;
}

/** Check if current browser & device hardware supports biometric platform authenticators */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }

  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch {
    return false;
  }
}

/** Check enrollment status */
export function getBiometricStatus(): BiometricStatus {
  if (typeof window === "undefined") {
    return { isSupported: false, isEnrolled: false, enrolledEmail: null };
  }

  const isEnrolled = localStorage.getItem("uhc_biometric_enabled") === "true";
  const enrolledEmail = localStorage.getItem("uhc_biometric_user");

  return {
    isSupported: Boolean(window.PublicKeyCredential),
    isEnrolled,
    enrolledEmail,
  };
}

/** Enroll device fingerprint / biometrics for the logged-in user */
export async function enrollBiometrics(userEmail: string, userName: string): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("Biometric authentication is not supported by your browser or device hardware.");
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
      userVerification: "required",
      requireResidentKey: false,
    },
    timeout: 60000,
    attestation: "none",
  };

  const credential = (await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Biometric enrollment was cancelled or failed.");
  }

  // Save successful enrollment metadata locally
  localStorage.setItem("uhc_biometric_enabled", "true");
  localStorage.setItem("uhc_biometric_cred_id", credential.id);
  localStorage.setItem("uhc_biometric_user", userEmail);
  localStorage.setItem("uhc_biometric_timestamp", Date.now().toString());

  return true;
}

/** Verify user identity via device fingerprint / biometrics */
export async function verifyBiometrics(): Promise<{ success: boolean; userEmail: string | null }> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("Biometric authentication is not supported on this device.");
  }

  const enrolledCredId = localStorage.getItem("uhc_biometric_cred_id");
  const enrolledEmail = localStorage.getItem("uhc_biometric_user");

  if (!enrolledCredId) {
    throw new Error("No fingerprint enrolled on this device yet. Please enable it in Settings first.");
  }

  const randomChallenge = new Uint8Array(32);
  window.crypto.getRandomValues(randomChallenge);

  const hostname = window.location.hostname;
  const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  // Convert stored base64 credential ID to Uint8Array if needed, or pass allowCredentials
  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge: randomChallenge,
    ...(hostname && !isIpAddress ? { rpId: hostname } : {}),
    userVerification: "required",
    timeout: 60000,
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });

  if (!assertion) {
    throw new Error("Biometric verification cancelled.");
  }

  return {
    success: true,
    userEmail: enrolledEmail,
  };
}

/** Disable and clear stored biometric profile */
export function removeBiometrics(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("uhc_biometric_enabled");
  localStorage.removeItem("uhc_biometric_cred_id");
  localStorage.removeItem("uhc_biometric_user");
  localStorage.removeItem("uhc_biometric_timestamp");
}
