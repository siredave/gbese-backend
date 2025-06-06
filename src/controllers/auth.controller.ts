import { Request, Response } from "express";
import { APIError } from "better-auth/api";
import { VerifyEmail } from "../types/auth.type";
import { authService } from "../services/auth.service";
import { handleRawResponse } from "../utils/utils";
import { StatusCodes } from "../types/api.type";

class AuthController {
  async register(req: Request, res: Response) {
    const signUpResponse = await authService.signUp(req.body);

    const responseBody = await handleRawResponse(res, signUpResponse);

    res.status(signUpResponse.status).json({
      message:
        "Account created successfully. Check your email for verification link",
      data: responseBody.user,
    });
  }

  async login(req: Request, res: Response) {
    const loginResponse = await authService.login(req.body);

    const responseBody = await handleRawResponse(res, loginResponse);

    res.status(loginResponse.status).json({
      message: "User logged in successfully",
      data: responseBody.user,
    });
  }

  async verifyEmail(req: Request<{}, {}, {}, VerifyEmail>, res: Response) {
    try {
      const response = await authService.verifyEmail(req.query);

      if (!response?.status) {
        throw new APIError(StatusCodes.BAD_REQUEST, {
          message: "Error verifying email",
        });
      }

      res.json({
        success: true,
        message: "Email verified successfully",
        data: response.user,
      });
    } catch (error) {
      if (!(error instanceof APIError)) throw error;

      if (
        (error.headers as Headers)
          .get("set-cookie")
          ?.includes("better-auth.session_token")
      ) {
        throw new APIError(200, {
          success: true,
          message: "Email verified successfully",
        });
      }

      throw new APIError(error.status, {
        message:
          (error.headers as Headers)
            .get("location")
            ?.split("=")[1]
            ?.toUpperCase() ?? "Error verifying email",
      });
    }
  }
}

export const authController = new AuthController();
