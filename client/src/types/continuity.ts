export type ContinuitySeverity = "low" | "medium" | "high" | "critical";

export interface ContinuityIssue {
  id: string;
  panelId: string;
  characterId?: string;
  field:
    | "costume"
    | "hairstyle"
    | "facial-features"
    | "accessories"
    | "time-of-day"
    | "weather"
    | "proportions"
    | "location"
    | "object"
    | "emotion"
    | "dialogue-speaker"
    | "scene";
  severity: ContinuitySeverity;
  description: string;
  expectedValue: string;
  detectedValue: string;
  recommendedFix: string;
  resolved: boolean;
}

export interface ContinuityValidationReport {
  timestamp: string;
  overallConsistencyScore: number; // 0 - 100
  issues: ContinuityIssue[];
  warnings: string[];
}
