export interface JwtPayload {
  jti: string;
  sessionId: string;
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  exp: number;
}
