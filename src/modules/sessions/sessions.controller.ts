import { Controller, Get, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Session } from 'src/common/entities/session.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('sessions')
@ApiTags('Sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  //temp till we have auth guard
  /**
   * Get all active sessions for a user
   * @param userId - The user ID
   * @returns Array of active sessions
   */
  @Get()
  async getUserSessions(@Query('userId') userId: string): Promise<Session[]> {
      return this.sessionsService.getUserSessions(userId);
  }
}
