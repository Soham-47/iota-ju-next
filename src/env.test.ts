import { describe, expect, it, vi } from "vitest";

vi.stubEnv("DATABASE_URL", "postgres://postgres:password@localhost:5432/iota_ju_db");
vi.stubEnv("PAYLOAD_SECRET", "a-secure-payload-secret-that-is-long-enough");
vi.stubEnv("SERVER_URL", "http://localhost:3000");

const { envSchema } = await import("./env");

describe("environment schema", () => {
  it("accepts valid required values and defaults the server URL", () => {
    expect(
      envSchema.parse({
        DATABASE_URL: "postgres://postgres:password@localhost:5432/iota_ju_db",
        PAYLOAD_SECRET: "a-secure-payload-secret-that-is-long-enough",
      }),
    ).toEqual({
      DATABASE_URL: "postgres://postgres:password@localhost:5432/iota_ju_db",
      PAYLOAD_SECRET: "a-secure-payload-secret-that-is-long-enough",
      SERVER_URL: "http://localhost:3000",
    });
  });

  it("rejects a short Payload secret", () => {
    expect(
      envSchema.safeParse({
        DATABASE_URL: "postgres://postgres:password@localhost:5432/iota_ju_db",
        PAYLOAD_SECRET: "too-short",
        SERVER_URL: "http://localhost:3000",
      }).success,
    ).toBe(false);
  });
});
