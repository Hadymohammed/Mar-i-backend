import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from 'src/common/entities/session.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { AUTH_NAME } from 'src/common/plugins/swagger.plugin';
import { IAuthRequest } from 'src/common/interfaces/IAuthRequest';

@Controller('sessions')
@ApiTags('Sessions')
@UseGuards(JwtGuard)
@ApiBearerAuth(AUTH_NAME)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  //temp till we have auth guard
  /**
   * Get all active sessions for a user
   * @param userId - The user ID
   * @returns Array of active sessions
   */
  @Get()
  async getUserSessions(@Request() req:IAuthRequest): Promise<Session[]> {
      const userId = req.session.userId;
      return this.sessionsService.getUserSessions(userId);
  }
}
