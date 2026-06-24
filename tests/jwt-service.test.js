import { describe, it, expect } from "vitest";
import { createJwtTokenService } from "../src/infrastructure/auth/JwtTokenService.js";

describe("JwtTokenService", () => {
  const testSecret = "test-secret-key-12345";
  const tokenService = createJwtTokenService(testSecret);

  it("should generate a valid JWT token string with 3 dot-separated parts", () => {
    const token = tokenService.generateToken({ id: "user-1", username: "admin" });
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT: header.payload.signature
  });

  it("should verify and decode a valid token returning correct payload", () => {
    const token = tokenService.generateToken({ id: "user-1", username: "admin" });
    const decoded = tokenService.verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe("user-1");
    expect(decoded.username).toBe("admin");
  });

  it("should return null for a tampered/corrupted token", () => {
    const token = tokenService.generateToken({ id: "user-1", username: "admin" });
    const tampered = token.slice(0, -5) + "XXXXX";
    const decoded = tokenService.verifyToken(tampered);
    expect(decoded).toBeNull();
  });

  it("should return null when verifying a token signed with a different secret", () => {
    const otherService = createJwtTokenService("completely-different-secret");
    const token = otherService.generateToken({ id: "user-1", username: "admin" });
    // Verify with the original service (different secret)
    const decoded = tokenService.verifyToken(token);
    expect(decoded).toBeNull();
  });

  it("should return null for a completely invalid token string", () => {
    const decoded = tokenService.verifyToken("not-a-jwt-token-at-all");
    expect(decoded).toBeNull();
  });

  it("should return null for an empty string token", () => {
    const decoded = tokenService.verifyToken("");
    expect(decoded).toBeNull();
  });

  it("should work correctly with a custom secret", () => {
    const customService = createJwtTokenService("my-custom-app-secret");
    const token = customService.generateToken({ id: "u99", username: "custom-user" });
    const decoded = customService.verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.id).toBe("u99");
    expect(decoded.username).toBe("custom-user");
  });

  it("should include expiration claim in the generated token", () => {
    const token = tokenService.generateToken({ id: "user-1", username: "admin" });
    const decoded = tokenService.verifyToken(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    // Default expiry is 8 hours = 28800 seconds
    expect(decoded.exp - decoded.iat).toBe(28800);
  });
});
