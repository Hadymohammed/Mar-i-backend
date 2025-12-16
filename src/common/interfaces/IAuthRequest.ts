import { JwtPayload } from "../services/jwt/interfaces/IJwtPayload";

export interface IAuthRequest extends Request {
    session: JwtPayload;
}
