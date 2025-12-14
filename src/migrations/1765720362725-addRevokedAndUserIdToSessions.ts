import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRevokedAndUserIdToSessions1765720362725 implements MigrationInterface {
    name = 'AddRevokedAndUserIdToSessions1765720362725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "revoked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "revoked"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
