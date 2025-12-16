export interface JwtPayload {
  jti: string;
  userId: string;
  sessionId: string;
  email: string;
  type: 'access' | 'refresh';
  exp: number;
}
