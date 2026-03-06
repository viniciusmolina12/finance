import { config } from "dotenv";

import { getSqliteConnection } from "#shared/infrastructure/database/sqlite-connection.js";
import { createApp } from "#presentation/app.js";

config();

const DEFAULT_PORT = 3001;

async function bootstrap() {
  const app = createApp();
  const raw_port = process.env.PORT ?? String(DEFAULT_PORT);
  const port = Number(raw_port);

  await getSqliteConnection();

  app.listen(port, () => {
    process.stdout.write(`Finance backend rodando na porta ${port}\n`);
  });
}

bootstrap().catch((error: unknown) => {
  process.stderr.write(`Erro ao iniciar servidor: ${String(error)}\n`);
  process.exitCode = 1;
});
