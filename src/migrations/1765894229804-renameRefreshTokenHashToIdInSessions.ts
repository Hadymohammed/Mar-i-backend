import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameRefreshTokenHashToIdInSessions1765894229804 implements MigrationInterface {
    name = 'RenameRefreshTokenHashToIdInSessions1765894229804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" RENAME COLUMN "refresh_token_hash" TO "refresh_token_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" RENAME COLUMN "refresh_token_id" TO "refresh_token_hash"`);
    }

}
