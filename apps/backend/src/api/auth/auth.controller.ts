import { Controller, Get, Request } from "@nestjs/common";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { FastifyReply, FastifyRequest } from "fastify";

import { apiLogger } from "..";

@Controller("/v1/auth")
export class AuthController {
  @ApiExcludeEndpoint()
  @Get()
  getMe(@Request() req: FastifyRequest) {
    return req.session.get("user");
  }

  @ApiExcludeEndpoint()
  @Get("/logout")
  async logout(@Request() req: FastifyRequest, res: FastifyReply) {
    try {
      await req.session.destroy();
      return res.redirect(200, "/");
    } catch (err) {
      apiLogger.error(`Auth controller error:`, err.stack);
    }
  }
}
