export const OtpRedisKeys = {
    value : (email: string) => `otp:${email}`,
    attempts : (email: string) => `otp:${email}:attempts`,
    resends : (email: string) => `otp:${email}:resends`,
    coolDown : (email: string) => `otp:${email}:cooldown`,
    blocked : (email: string) => `otp:${email}:blocked`,
};
