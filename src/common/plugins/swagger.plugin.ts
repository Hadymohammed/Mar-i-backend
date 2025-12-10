import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme } from 'swagger-themes';
import { SwaggerThemeNameEnum } from 'swagger-themes/build/enums/swagger-theme-name';
import * as swaggerUi from 'swagger-ui-express';

export function setupSwagger(app: INestApplication): void {
  if(!process.env.ENABLE_DOCS) return;

  const APP_NAME = process.env.APP_NAME;
  const STAGE = process.env.STAGE;

  const theme = new SwaggerTheme();
  const content = theme.getBuffer(SwaggerThemeNameEnum.DARK);

  const options = new DocumentBuilder()
    .setTitle(`${APP_NAME} / ${STAGE}`)
    .setDescription('API documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      "Mar'i",
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document, {
    customCssUrl: '/docs/swagger-ui.css',
    customSiteTitle: `${APP_NAME} / ${STAGE}`,
    swaggerOptions: {
      docExpansion: 'none',
      deepLinking: true,
      persistAuthorization: true,
      filter: true,
      tagsSorter: 'alpha',
    },
  }));
  
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      deepLinking: true,
      persistAuthorization: true,
      filter: true,
      tagsSorter: 'alpha',
    },
    customCss: content,
    customSiteTitle: `${APP_NAME} / ${STAGE}`,
  });
}
