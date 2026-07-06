import { describe, it, expect } from "vitest";
import { TYPE_COMPASS_QUESTIONS, diagnoseTypeCompass, type TypeCompassAnswers, type Pole } from "./type-compass";

function buildAnswers(polePreference: Record<Pole, number>): TypeCompassAnswers {
  const answers: TypeCompassAnswers = {};
  for (const q of TYPE_COMPASS_QUESTIONS) {
    answers[q.id] = polePreference[q.pole] as TypeCompassAnswers[string];
  }
  return answers;
}

describe("diagnoseTypeCompass", () => {
  it("全問でE/S/T/J側に強く同意するとESTJ型になる", () => {
    const answers = buildAnswers({ E: 5, I: 1, S: 5, N: 1, T: 5, F: 1, J: 5, P: 1 });
    const result = diagnoseTypeCompass(answers);

    expect(result.type).toBe("ESTJ");
    expect(result.axisResults.find((r) => r.axis === "EI")?.strength).toBe(83);
    expect(result.traitVector.sociability).toBe(83);
    expect(result.traitVector.introspection).toBe(17);
  });

  it("全問でI/N/F/P側に強く同意するとINFP型になる", () => {
    const answers = buildAnswers({ E: 1, I: 5, S: 1, N: 5, T: 1, F: 5, J: 1, P: 5 });
    const result = diagnoseTypeCompass(answers);

    expect(result.type).toBe("INFP");
  });

  it("すべて中間(3)で回答すると各軸50%になり、先頭側のポールがタイブレークで採用される", () => {
    const answers = buildAnswers({ E: 3, I: 3, S: 3, N: 3, T: 3, F: 3, J: 3, P: 3 });
    const result = diagnoseTypeCompass(answers);

    expect(result.type).toBe("ESTJ");
    for (const r of result.axisResults) {
      expect(r.strength).toBe(50);
    }
  });

  it("未回答の設問があるとエラーを投げる", () => {
    const answers = buildAnswers({ E: 5, I: 1, S: 5, N: 1, T: 5, F: 1, J: 5, P: 1 });
    delete answers["ei1"];

    expect(() => diagnoseTypeCompass(answers)).toThrow();
  });
});
