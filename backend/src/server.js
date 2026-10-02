import { app } from './app.js';
import { config } from './config.js';
import { prisma } from './utils/prisma.js';

const server = app.listen(config.port, () => {
  console.log(`API rodando na porta ${config.port}`);
});

function shutdown(signal) {
  console.log(`${signal} recebido, encerrando...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
