# API Firebird - Node.js + TypeScript

API REST para gerenciar tabelas de classificação tributária no banco de dados Firebird 3.0.

## 🚀 Começando

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Firebird 3.0

### Instalação

```bash
npm install
```

### Configuração

1. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
FIREBIRD_HOST=127.0.0.1
FIREBIRD_PORT=3030
FIREBIRD_DATABASE=D:\Clientes\SouzaAgro\10.2025\v1\BANK.FDB
FIREBIRD_USER=SYSDBA
FIREBIRD_PASSWORD=masterkey
FIREBIRD_POOL_SIZE=5
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento (com hot reload)
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Compila e inicia o servidor em produção

## 🏗️ Arquitetura

```
src/
├── app.ts                 # Aplicação principal
├── db/
│   └── firebird.ts       # Pool de conexões Firebird
├── models/
│   ├── cst_ibscbs.ts     # Interface CST_IBSCBS
│   └── cclasstrib.ts     # Interface CCLASSTRIB
├── repositories/
│   ├── cst_ibscbs.repository.ts    # Acesso a dados CST_IBSCBS
│   └── cclasstrib.repository.ts    # Acesso a dados CCLASSTRIB
├── services/
│   ├── cst_ibscbs.service.ts       # Lógica de negócio CST_IBSCBS
│   └── cclasstrib.service.ts       # Lógica de negócio CCLASSTRIB
├── routes/
│   ├── cst_ibscbs.ts     # Endpoints CST_IBSCBS
│   └── cclasstrib.ts     # Endpoints CCLASSTRIB
├── middleware/
│   └── errorHandler.ts   # Tratamento centralizado de erros
└── utils/
    ├── logger.ts         # Sistema de logging
    └── validation.ts     # Schemas de validação
```

## 📚 Endpoints da API

### CST_IBSCBS

**Listar registros (com paginação)**
```
GET /cst_ibscbs?limit=10&offset=0&sortBy=CODIGO&sortOrder=ASC
```

**Buscar um registro**
```
GET /cst_ibscbs/{id}
```

**Criar registro**
```
POST /cst_ibscbs
Content-Type: application/json

{
  "CODIGO": "123456",
  "DESCRICAO": "Descrição da classificação",
  "TRIBUTACAO_REGULAR": true,
  "REDUCAO_BC_CST": false,
  "REDUCAO_ALIQUOTA": false,
  "TRANSFERENCIA_CREDITO": false,
  "DIFERIMENTO": false,
  "MONOFASICA": false,
  "CREDITO_PRESUMIDO_IBS_ZFM": false,
  "AJUSTE_COMPETENCIA": false
}
```

**Atualizar registro**
```
PUT /cst_ibscbs/{id}
Content-Type: application/json

{
  "DESCRICAO": "Descrição atualizada",
  "TRIBUTACAO_REGULAR": true
}
```

**Deletar registro**
```
DELETE /cst_ibscbs/{id}
```

### CCLASSTRIB

**Listar registros (com paginação)**
```
GET /cclasstrib?limit=10&offset=0&sortBy=CODIGO&sortOrder=ASC
```

**Buscar um registro**
```
GET /cclasstrib/{id}
```

**Criar registro**
```
POST /cclasstrib
Content-Type: application/json

{
  "CST_IBSCBS_ID": 1,
  "CODIGO": "1234",
  "DESCRICAO": "Descrição",
  "PERCENTUAL_REDUCAO_IBS": 12.50,
  "PERCENTUAL_REDUCAO_CBS": 8.75,
  "TIPO_ALIQUOTA": "NORMAL",
  "NFE": true,
  "NFCE": false
}
```

**Atualizar registro**
```
PUT /cclasstrib/{id}
Content-Type: application/json

{
  "DESCRICAO": "Nova descrição",
  "PERCENTUAL_REDUCAO_IBS": 15.00
}
```

**Deletar registro**
```
DELETE /cclasstrib/{id}
```

## ✨ Melhorias Implementadas

✅ **Vari áveis de Ambiente** - Credenciais em `.env`
✅ **Pool de Conexões** - Gerenciamento eficiente de conexões
✅ **Paginação** - Suporte a limit, offset, ordenação
✅ **Validação** - Schemas Joi para validação de entrada
✅ **Logging** - Sistema de logging com Pino
✅ **Tratamento de Erros** - Middleware centralizado
✅ **Arquitetura em Camadas** - Repositório, Serviço, Rota
✅ **Graceful Shutdown** - Encerramento seguro da aplicação
✅ **TypeScript Strict** - Type-safety máximo

## 🔒 Segurança

- Validação de entrada em todos os endpoints
- Prepared statements contra SQL injection
- Credenciais em variáveis de ambiente
- Logging de erros para auditoria

## 📦 Dependências Principais

- **express** - Framework web
- **node-firebird** - Driver Firebird
- **joi** - Validação de dados
- **pino** - Logger de performance alta
- **dotenv** - Gerenciamento de variáveis de ambiente
- **typescript** - Tipagem estática

## 📄 Licença

ISC
