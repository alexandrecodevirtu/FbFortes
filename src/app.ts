
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializePool, closePool } from './db/firebird';
import { initializePostgres, closePostgres } from './db/postgres';
import cnhRouter from './routes/cnh';
import rodorricaLogRouter from './routes/rodorrica_log';
import diariaRouter from './routes/diaria';
import diariaRecebimentoRouter from './routes/diaria_recebimento';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = parseInt(process.env.PORT || '3000');

// Middleware
app.use(bodyParser.json());

// Rotas
app.get('/', (req, res) => {
  res.json({ message: 'API Firebird está rodando!', version: '1.0.0' });
});

app.use('/cnh', cnhRouter);
app.use('/rodorrica_log', rodorricaLogRouter);
app.use('/diarias', diariaRouter);
app.use('/diaria_recebimentos', diariaRecebimentoRouter);

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Inicializa o servidor
async function startServer() {
  try {
    await initializePool();
    logger.info('Pool de conexões inicializado com sucesso');

    await initializePostgres();
    logger.info('Conexão com PostgreSQL inicializada com sucesso');

    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM recebido, encerrando gracefully...');
      await closePool();
      await closePostgres();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT recebido, encerrando gracefully...');
      await closePool();
      await closePostgres();
      process.exit(0);
    });
  } catch (error) {
    logger.error(error, 'Erro ao inicializar servidor');
    process.exit(1);
  }
}

startServer();

export default app;
