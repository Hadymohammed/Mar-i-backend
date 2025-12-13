export interface JwtPayload {
  sessionId: string;
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}
