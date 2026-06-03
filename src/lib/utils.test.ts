import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("junta classes simples", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("aplica classes condicionais via objeto", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("resolve conflitos de tailwind mantendo a última", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
