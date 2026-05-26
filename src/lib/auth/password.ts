export type PasswordEvaluation = {
  reqs: {
    length: boolean;
    lower: boolean;
    upper: boolean;
    number: boolean;
    symbol: boolean;
  };
  /** 0 (empty) .. 4 (excellent) */
  strength: 0 | 1 | 2 | 3 | 4;
};

export const STRENGTH_LABELS = ["—", "Weak", "Fair", "Strong", "Excellent"] as const;

export function evaluatePassword(pw: string): PasswordEvaluation {
  const reqs = {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
  const score = Object.values(reqs).filter(Boolean).length;
  let strength: PasswordEvaluation["strength"] = 0;
  if (pw.length === 0) strength = 0;
  else if (score <= 2) strength = 1;
  else if (score === 3) strength = 2;
  else if (score === 4) strength = 3;
  else if (score === 5 && pw.length >= 12) strength = 4;
  else strength = 3;
  return { reqs, strength };
}
