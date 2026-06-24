import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock function so it's available inside vi.mock factory
const { mockVerifyToken } = vi.hoisted(() => ({
  mockVerifyToken: vi.fn(),
}));

// Mock the JwtTokenService before authHook imports it at module level
vi.mock("../src/infrastructure/auth/JwtTokenService.js", () => ({
  createJwtTokenService: () => ({
    verifyToken: mockVerifyToken,
  }),
}));

import { authHook } from "../src/presentation/hooks/authHook.js";

describe("authHook - Route Authentication Guard", () => {
  let mockRequest;
  let mockReply;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      headers: {},
      cookies: {},
    };
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  it("should return 401 with 'missing' message when no token is provided anywhere", async () => {
    await authHook(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Unauthorized: Access token is missing",
    });
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it("should extract token from Authorization Bearer header and verify it", async () => {
    mockRequest.headers.authorization = "Bearer valid-header-token";
    mockVerifyToken.mockReturnValue({ id: "user-1", username: "admin" });

    await authHook(mockRequest, mockReply);

    expect(mockVerifyToken).toHaveBeenCalledWith("valid-header-token");
    expect(mockRequest.user).toEqual({ id: "user-1", username: "admin" });
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it("should fallback to cookie token when Authorization header is absent", async () => {
    mockRequest.cookies.token = "cookie-token-xyz";
    mockVerifyToken.mockReturnValue({ id: "user-2", username: "hr-manager" });

    await authHook(mockRequest, mockReply);

    expect(mockVerifyToken).toHaveBeenCalledWith("cookie-token-xyz");
    expect(mockRequest.user).toEqual({ id: "user-2", username: "hr-manager" });
  });

  it("should prefer Authorization header over cookie when both are present", async () => {
    mockRequest.headers.authorization = "Bearer header-token";
    mockRequest.cookies.token = "cookie-token";
    mockVerifyToken.mockReturnValue({ id: "u1", username: "test" });

    await authHook(mockRequest, mockReply);

    expect(mockVerifyToken).toHaveBeenCalledWith("header-token");
  });

  it("should return 401 with 'invalid or expired' message when token verification fails", async () => {
    mockRequest.headers.authorization = "Bearer expired-token";
    mockVerifyToken.mockReturnValue(null);

    await authHook(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Unauthorized: Access token is invalid or expired",
    });
    expect(mockRequest.user).toBeUndefined();
  });

  it("should attach decoded user payload to request.user on successful verification", async () => {
    const decodedPayload = { id: "admin-uuid", username: "admin", iat: 123, exp: 456 };
    mockRequest.headers.authorization = "Bearer good-token";
    mockVerifyToken.mockReturnValue(decodedPayload);

    await authHook(mockRequest, mockReply);

    expect(mockRequest.user).toEqual(decodedPayload);
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it("should not extract token when Authorization header does not start with 'Bearer '", async () => {
    mockRequest.headers.authorization = "Basic dXNlcjpwYXNz"; // Not Bearer
    // No cookie either

    await authHook(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Unauthorized: Access token is missing",
    });
  });

  it("should handle missing cookies object gracefully", async () => {
    mockRequest.cookies = undefined;

    await authHook(mockRequest, mockReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Unauthorized: Access token is missing",
    });
  });
});
