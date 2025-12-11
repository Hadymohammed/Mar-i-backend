import { Request } from "express";

export class CreateSessionDto {
    userId: number;
    refreshToken: string;
    RequestObj : Request
}
