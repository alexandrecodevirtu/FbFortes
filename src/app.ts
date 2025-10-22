
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initializePool, closePool } from './db/firebird';
import cstIbscbsRouter from './routes/cst_ibscbs';
import cclasstribRouter from './routes/cclasstrib';
import cnhRouter from './routes/cnh';
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

app.use('/cst_ibscbs', cstIbscbsRouter);
app.use('/cclasstrib', cclasstribRouter);
app.use('/cnh', cnhRouter);

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Inicializa o servidor
async function startServer() {
  try {
    await initializePool();
    logger.info('Pool de conexões inicializado com sucesso');

    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM recebido, encerrando gracefully...');
      await closePool();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT recebido, encerrando gracefully...');
      await closePool();
      process.exit(0);
    });
  } catch (error) {
    logger.error(error, 'Erro ao inicializar servidor');
    process.exit(1);
  }
}

startServer();

export default app;
