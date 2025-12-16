export const OtpRedisKeys = {
    value : (email: string) => `otp:${email}`,
    attempts : (email: string) => `otp:${email}:attempts`,
    resends : (email: string) => `otp:${email}:resends`,
    coolDown : (email: string) => `otp:${email}:cooldown`,
    blocked : (email: string) => `otp:${email}:blocked`,
};

export const TokensBlacklistRedisKey = {
    refreshToken: (jti: string) => `tokens_blacklist:refresh_token:${jti}`,
    accessToken: (jti: string) => `tokens_blacklist:access_token:${jti}`,
    session: (sessionId: string) => `tokens_blacklist:session:${sessionId}`,
}