export type ThreatLevel = "clean" | "low" | "medium" | "high" | "critical";

export interface DetectedThreat {
  category: "prompt_injection" | "system_prompt_leak" | "harmful_content" | "pii_exposure" | "jailbreak_attempt";
  description: string;
  matchedPattern?: string;
  severity: ThreatLevel;
}

export interface PromptScanResult {
  isSafe: boolean;
  threatLevel: ThreatLevel;
  originalPrompt: string;
  sanitizedPrompt: string;
  threats: DetectedThreat[];
  confidenceScore: number; // 0-100
  latencyMs: number;
}

export interface DrmCertificate {
  certificateId: string;
  comicId: string;
  comicTitle: string;
  creatorName: string;
  creatorEmail: string;
  sha256Fingerprint: string;
  timestamp: string;
  licenseType: "Commercial Creator License" | "Editorial Standard" | "Creative Commons CC-BY-NC";
  watermarkToken: string;
  signatureVerified: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType:
    | "PROMPT_SCAN_CLEAN"
    | "INJECTION_ATTEMPT_BLOCKED"
    | "HARMFUL_CONTENT_SANITIZED"
    | "PII_REDACTED"
    | "DRM_SIGNATURE_GENERATED"
    | "SECRET_VAULT_AUDITED"
    | "RATE_LIMIT_CHECKED";
  severity: "info" | "warning" | "error" | "success";
  details: string;
  clientIpMasked?: string;
}

export interface SecurityPolicyConfig {
  strictPromptFirewall: boolean;
  contentModerationFilter: boolean;
  drmWatermarkingEnabled: boolean;
  antiAbuseRateLimiting: boolean;
  piiRedactionEnabled: boolean;
  auditLoggingEnabled: boolean;
}

export interface SecurityHealthScore {
  overallScore: number; // 0-100
  ratingGrade: "A+" | "A" | "B" | "C" | "F";
  activeShieldsCount: number;
  totalShieldsCount: number;
  lastAuditTimestamp: string;
  serverSecretStatus: {
    geminiKeyIsolated: boolean;
    oauthCredentialsProtected: boolean;
    databaseEncrypted: boolean;
    storageBucketSecured: boolean;
  };
}
