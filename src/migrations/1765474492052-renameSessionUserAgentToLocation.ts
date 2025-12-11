import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSessionUserAgentToLocation1765474492052 implements MigrationInterface {
    name = 'RenameSessionUserAgentToLocation1765474492052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" RENAME COLUMN "user_agent" TO "location"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" RENAME COLUMN "location" TO "user_agent"`);
    }

}
