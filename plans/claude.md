Guia de Uso - Sistema de Controle de Diárias (1:1)
🎯 Modelo Simplificado: 1 CT-e = 1 Motorista = 1 Pagamento

📋 Fluxo Operacional Simplificado
Passo 1: Registrar CT-e com Pagamento (Tudo junto!)
Como o relacionamento é 1:1, você registra o CT-e e o pagamento ao motorista em uma única operação:
sqlINSERT INTO ctes (
    numero_cte, chave_acesso, cliente_id, motorista_id,
    data_emissao, valor_frete, origem, destino,
    data_pagamento, valor_pago_motorista, quantidade_diarias, 
    valor_por_diaria, forma_pagamento
) VALUES (
    '000045',                                           -- Número do CT-e
    'chave44digitos',                                  -- Chave de acesso
    1,                                                 -- ID do cliente
    1,                                                 -- ID do motorista
    '2024-10-24',                                      -- Data emissão
    3500.00,                                           -- Valor do frete
    'São Paulo - SP',                                  -- Origem
    'Rio de Janeiro - RJ',                             -- Destino
    CURRENT_DATE,                                      -- Data do pagamento
    1200.00,                                           -- Valor pago ao motorista
    3,                                                 -- Quantidade de diárias
    400.00,                                            -- Valor por diária
    'PIX'                                              -- Forma de pagamento
);

-- ✅ Isso automaticamente cria um registro na tabela conciliacoes!
Passo 2: Criar Solicitação de Reembolso
Use a procedure para criar automaticamente (pega o valor do CT-e):
sql-- Forma automática (recomendada)
CALL sp_criar_solicitacao_reembolso(1, CURRENT_DATE);
-- Parâmetros: (id_do_cte, data_da_solicitacao)

-- OU forma manual
INSERT INTO solicitacoes_reembolso (cte_id, valor_solicitado, data_solicitacao)
VALUES (1, 1200.00, CURRENT_DATE);
Passo 3: Registrar Resposta do Cliente
Cenário A: Cliente aprovou o valor integral
sqlUPDATE solicitacoes_reembolso 
SET status = 'Aprovada',
    valor_aprovado = 1200.00,
    data_resposta = CURRENT_DATE
WHERE cte_id = 1;
Cenário B: Cliente aprovou valor menor (R$ 800)
sqlUPDATE solicitacoes_reembolso 
SET status = 'Parcialmente Aprovada',
    valor_aprovado = 800.00,
    data_resposta = CURRENT_DATE,
    motivo_divergencia = 'Cliente aprovou apenas 2 diárias'
WHERE cte_id = 1;
Cenário C: Cliente aprovou valor maior (R$ 1.600)
sqlUPDATE solicitacoes_reembolso 
SET status = 'Aprovada',
    valor_aprovado = 1600.00,
    data_resposta = CURRENT_DATE,
    motivo_divergencia = 'Cliente pagou diária extra'
WHERE cte_id = 1;
Cenário D: Cliente rejeitou
sqlUPDATE solicitacoes_reembolso 
SET status = 'Rejeitada',
    valor_aprovado = 0.00,
    data_resposta = CURRENT_DATE,
    motivo_divergencia = 'Viagem não autorizada'
WHERE cte_id = 1;
Passo 4: Registrar Recebimento = BAIXA AUTOMÁTICA ✅
sqlINSERT INTO recebimentos (
    solicitacao_reembolso_id,
    data_recebimento,
    valor_recebido,
    forma_recebimento
) VALUES (
    1,              -- ID da solicitação
    CURRENT_DATE,   -- Data que recebeu
    800.00,         -- Valor recebido (pode ser maior, igual ou menor)
    'Transferência' -- Como recebeu
);

-- ✅ BAIXA AUTOMÁTICA EXECUTADA!
-- O sistema automaticamente:
-- 1. Calcula a diferença (valor_recebido - valor_pago)
-- 2. Define o resultado: LUCRO, NEUTRO ou PREJUÍZO
-- 3. Atualiza a conciliação
-- 4. Registra no log de baixas
-- 5. Marca a operação como concluída

🎯 Entendendo a BAIXA AUTOMÁTICA
Quando você registra um recebimento, o sistema faz automaticamente:
Exemplo 1: Baixa com LUCRO
sql-- Você pagou: R$ 1.200,00
-- Cliente pagou: R$ 1.600,00
-- Sistema registra: +R$ 400,00 (Lucro de 33,33%)
-- Status: "Recebido - Lucro" ✅
Exemplo 2: Baixa NEUTRA
sql-- Você pagou: R$ 1.200,00
-- Cliente pagou: R$ 1.200,00
-- Sistema registra: R$ 0,00 (Neutro 0%)
-- Status: "Recebido - Neutro" ✅
Exemplo 3: Baixa com PREJUÍZO
sql-- Você pagou: R$ 1.200,00
-- Cliente pagou: R$ 800,00
-- Sistema registra: -R$ 400,00 (Prejuízo de 33,33%)
-- Status: "Recebido - Prejuízo" ❌

📊 Consultas Principais
1. Ver Operação Completa de um CT-e Específico
sqlSELECT * FROM vw_operacoes_completas 
WHERE numero_cte = '000045';
Retorna: Todos os dados em uma linha (CT-e, pagamento, solicitação, recebimento, resultado)
2. Dashboard Geral
sqlSELECT * FROM vw_dashboard_executivo;
Retorna: Resumo executivo com totais pagos, recebidos, pendências e resultado geral
3. CT-es Pendentes de Ação
sqlSELECT * FROM vw_pendencias
ORDER BY dias_aguardando DESC;
Retorna: Lista do que precisa fazer (criar solicitação, aguardar aprovação, aguardar recebimento)
4. Análise por Cliente
sqlSELECT * FROM vw_analise_por_cliente
ORDER BY resultado DESC;
Retorna: Desempenho de cada cliente (taxa de aprovação, resultado financeiro, prazo médio)
5. CT-es com Prejuízo
sqlSELECT numero_cte, motorista, cliente, 
       valor_pago_motorista, valor_recebido, resultado
FROM vw_operacoes_completas
WHERE situacao = 'Prejuízo'
ORDER BY resultado;
6. CT-es com Lucro
sqlSELECT numero_cte, motorista, cliente,
       valor_pago_motorista, valor_recebido, resultado,
       percentual_resultado
FROM vw_operacoes_completas
WHERE situacao = 'Lucro'
ORDER BY resultado DESC;
7. Operações Atrasadas (>45 dias sem receber)
sqlSELECT numero_cte, cliente, motorista,
       data_pagamento, valor_pago_motorista,
       dias_desde_pagamento, status_financeiro
FROM vw_operacoes_completas
WHERE situacao = 'Pendente'
  AND dias_desde_pagamento > 45
ORDER BY dias_desde_pagamento DESC;
8. Ver TODAS as Baixas Realizadas
sqlSELECT * FROM vw_operacoes_baixadas
ORDER BY data_baixa DESC;
9. Baixas com LUCRO
sqlSELECT numero_cte, cliente, motorista,
       valor_pago_motorista, valor_recebido, resultado,
       percentual_diferenca, data_baixa
FROM vw_operacoes_baixadas
WHERE tipo_resultado = 'LUCRO'
ORDER BY resultado DESC;
10. Baixas com PREJUÍZO
sqlSELECT numero_cte, cliente, motorista,
       valor_pago_motorista, valor_recebido, resultado,
       percentual_diferenca, data_baixa
FROM vw_operacoes_baixadas
WHERE tipo_resultado = 'PREJUÍZO'
ORDER BY resultado;
11. Baixas NEUTRAS (valor igual)
sqlSELECT numero_cte, cliente, motorista,
       valor_pago_motorista, valor_recebido, data_baixa
FROM vw_operacoes_baixadas
WHERE tipo_resultado = 'NEUTRO'
ORDER BY data_baixa DESC;
12. Relatório de Baixas por Período
sqlSELECT 
    DATE_FORMAT(data_baixa, '%Y-%m') AS mes,
    COUNT(*) AS total_baixas,
    SUM(valor_pago_motorista) AS total_pago,
    SUM(valor_recebido) AS total_recebido,
    SUM(resultado) AS resultado_periodo,
    COUNT(CASE WHEN tipo_resultado = 'LUCRO' THEN 1 END) AS baixas_lucro,
    COUNT(CASE WHEN tipo_resultado = 'NEUTRO' THEN 1 END) AS baixas_neutras,
    COUNT(CASE WHEN tipo_resultado = 'PREJUÍZO' THEN 1 END) AS baixas_prejuizo
FROM vw_operacoes_baixadas
GROUP BY DATE_FORMAT(data_baixa, '%Y-%m')
ORDER BY mes DESC;
13. Histórico Completo do Log de Baixas
sqlSELECT 
    lb.id,
    c.numero_cte,
    lb.data_baixa,
    lb.valor_pago,
    lb.valor_recebido,
    lb.resultado,
    lb.resultado_tipo,
    lb.data_registro AS timestamp_baixa
FROM log_baixas lb
INNER JOIN ctes c ON lb.cte_id = c.id
ORDER BY lb.data_registro DESC;
14. Relatório Mensal
sqlSELECT 
    DATE_FORMAT(c.data_pagamento, '%Y-%m') AS mes,
    COUNT(*) AS qtd_operacoes,
    SUM(c.valor_pago_motorista) AS total_pago,
    COUNT(r.id) AS operacoes_recebidas,
    SUM(COALESCE(r.valor_recebido, 0)) AS total_recebido,
    SUM(COALESCE(r.valor_recebido, 0)) - SUM(c.valor_pago_motorista) AS resultado_mes,
    COUNT(*) - COUNT(r.id) AS pendentes
FROM ctes c
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
GROUP BY DATE_FORMAT(c.data_pagamento, '%Y-%m')
ORDER BY mes DESC;
15. Ranking de Motoristas (Performance)
sqlSELECT 
    m.nome AS motorista,
    COUNT(c.id) AS total_operacoes,
    SUM(c.quantidade_diarias) AS total_diarias,
    SUM(c.valor_pago_motorista) AS total_recebido,
    ROUND(AVG(c.valor_por_diaria), 2) AS valor_medio_diaria
FROM motoristas m
INNER JOIN ctes c ON m.id = c.motorista_id
GROUP BY m.id, m.nome
ORDER BY total_operacoes DESC;
16. Fluxo de Caixa Projetadoebido,
ROUND(AVG(c.valor_por_diaria), 2) AS valor_medio_diaria
FROM motoristas m
INNER JOIN ctes c ON m.id = c.motorista_id
GROUP BY m.id, m.nome
ORDER BY total_operacoes DESC;

### 10. Fluxo de Caixa Projetado
```sql
SELECT 
    c.numero_cte,
    cl.razao_social AS cliente,
    c.data_pagamento AS saida_realizada,
    c.valor_pago_motorista AS valor_saida,
    DATE_ADD(c.data_pagamento, INTERVAL cl.prazo_pagamento DAY) AS entrada_prevista,
    sr.valor_aprovado AS valor_entrada_previsto,
    r.data_recebimento AS entrada_realizada,
    r.valor_recebido AS valor_entrada_realizado,
    CASE 
        WHEN r.id IS NULL THEN 'Aguardando'
        WHEN r.data_recebimento <= DATE_ADD(c.data_pagamento, INTERVAL cl.prazo_pagamento DAY) THEN 'No Prazo'
        ELSE 'Atrasado'
    END AS status_prazo
FROM ctes c
INNER JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
WHERE r.id IS NULL OR r.data_recebimento >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)
ORDER BY entrada_prevista;
```

---

## 💡 Exemplos Práticos Completos

### **Exemplo 1: Operação Simples (Valor aprovado = Valor pago)**
```sql
-- 1. Registrar CT-e e Pagamento
INSERT INTO ctes (numero_cte, chave_acesso, cliente_id, motorista_id,
                  data_emissao, valor_frete, origem, destino,
                  data_pagamento, valor_pago_motorista, quantidade_diarias, 
                  valor_por_diaria, forma_pagamento)
VALUES ('000100', 'CHAVE44', 1, 1, '2024-10-24', 3500.00, 
        'SP', 'RJ', '2024-10-24', 1200.00, 3, 400.00, 'PIX');

-- 2. Criar Solicitação (automática)
CALL sp_criar_solicitacao_reembolso(LAST_INSERT_ID(), CURRENT_DATE);

-- 3. Cliente Aprovou Integral
UPDATE solicitacoes_reembolso 
SET status = 'Aprovada', valor_aprovado = 1200.00, data_resposta = '2024-11-05'
WHERE cte_id = LAST_INSERT_ID();

-- 4. Registrar Recebimento
INSERT INTO recebimentos (solicitacao_reembolso_id, data_recebimento, 
                          valor_recebido, forma_recebimento)
VALUES (LAST_INSERT_ID(), '2024-11-25', 1200.00, 'Transferência');

-- 5. Consultar Resultado
SELECT numero_cte, valor_pago_motorista, valor_recebido, 
       resultado, situacao, status_financeiro
FROM vw_operacoes_completas
WHERE numero_cte = '000100';
-- Resultado: R$ 0,00 (Neutro)
```

### **Exemplo 2: Operação com Prejuízo (Cliente aprovou menos)**
```sql
-- 1. Registrar CT-e e Pagamento
INSERT INTO ctes (numero_cte, chave_acesso, cliente_id, motorista_id,
                  data_emissao, valor_frete, origem, destino,
                  data_pagamento, valor_pago_motorista, quantidade_diarias, 
                  valor_por_diaria, forma_pagamento)
VALUES ('000101', 'CHAVE45', 1, 2, '2024-10-24', 3500.00,
        'SP', 'BH', '2024-10-24', 1200.00, 3, 400.00, 'PIX');

-- 2. Criar Solicitação
CALL sp_criar_solicitacao_reembolso(LAST_INSERT_ID(), CURRENT_DATE);

-- 3. Cliente Aprovou Parcial (apenas 2 diárias)
UPDATE solicitacoes_reembolso 
SET status = 'Parcialmente Aprovada', 
    valor_aprovado = 800.00, 
    data_resposta = '2024-11-05',
    motivo_divergencia = 'Cliente aprovou apenas 2 diárias conforme contrato'
WHERE cte_id = LAST_INSERT_ID();

-- 4. Registrar Recebimento
INSERT INTO recebimentos (solicitacao_reembolso_id, data_recebimento,
                          valor_recebido, forma_recebimento)
VALUES (LAST_INSERT_ID(), '2024-11-25', 800.00, 'Transferência');

-- 5. Consultar Resultado
SELECT numero_cte, valor_pago_motorista, valor_recebido,
       resultado, percentual_resultado, situacao
FROM vw_operacoes_completas
WHERE numero_cte = '000101';
-- Resultado: -R$ 400,00 (Prejuízo de 33,33%)
```

### **Exemplo 3: Operação com Lucro (Cliente pagou mais)**
```sql
-- 1. Registrar CT-e e Pagamento
INSERT INTO ctes (numero_cte, chave_acesso, cliente_id, motorista_id,
                  data_emissao, valor_frete, origem, destino,
                  data_pagamento, valor_pago_motorista, quantidade_diarias,
                  valor_por_diaria, forma_pagamento)
VALUES ('000102', 'CHAVE46', 2, 3, '2024-10-24', 4500.00,
        'SP', 'Curitiba', '2024-10-24', 1200.00, 3, 400.00, 'PIX');

-- 2. Criar Solicitação
CALL sp_criar_solicitacao_reembolso(LAST_INSERT_ID(), CURRENT_DATE);

-- 3. Cliente Aprovou Valor Maior (pagou diária extra + pernoite)
UPDATE solicitacoes_reembolso 
SET status = 'Aprovada',
    valor_aprovado = 1600.00,
    data_resposta = '2024-11-05',
    motivo_divergencia = 'Cliente pagou 4 diárias conforme tempo de viagem'
WHERE cte_id = LAST_INSERT_ID();

-- 4. Registrar Recebimento
INSERT INTO recebimentos (solicitacao_reembolso_id, data_recebimento,
                          valor_recebido, forma_recebimento)
VALUES (LAST_INSERT_ID(), '2024-11-25', 1600.00, 'Boleto');

-- 5. Consultar Resultado
SELECT numero_cte, valor_pago_motorista, valor_recebido,
       resultado, percentual_resultado, situacao
FROM vw_operacoes_completas
WHERE numero_cte = '000102';
-- Resultado: +R$ 400,00 (Lucro de 33,33%)
```

---

## 🔍 Consultas de Gestão Avançadas

### Identificar Clientes Problemáticos
```sql
SELECT 
    razao_social,
    total_operacoes,
    aprovacoes_parciais,
    rejeicoes,
    ROUND((aprovacoes_parciais + rejeicoes) / total_operacoes * 100, 2) AS perc_problemas,
    resultado,
    prazo_medio_recebimento
FROM vw_analise_por_cliente
WHERE (aprovacoes_parciais + rejeicoes) / total_operacoes > 0.3 -- Mais de 30% de problemas
ORDER BY perc_problemas DESC;
```

### Capital de Giro Comprometido
```sql
SELECT 
    SUM(c.valor_pago_motorista) AS capital_comprometido,
    COUNT(*) AS operacoes_aguardando,
    MIN(c.data_pagamento) AS pagamento_mais_antigo,
    MAX(DATEDIFF(CURRENT_DATE, c.data_pagamento)) AS dias_mais_antigo
FROM ctes c
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
WHERE r.id IS NULL;
```

### Análise de Inadimplência por Cliente
```sql
SELECT 
    cl.razao_social,
    COUNT(*) AS operacoes_em_atraso,
    SUM(c.valor_pago_motorista) AS valor_em_atraso,
    AVG(DATEDIFF(CURRENT_DATE, c.data_pagamento)) AS dias_medio_atraso,
    MAX(DATEDIFF(CURRENT_DATE, c.data_pagamento)) AS maior_atraso
FROM ctes c
INNER JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
WHERE r.id IS NULL
  AND DATEDIFF(CURRENT_DATE, c.data_pagamento) > cl.prazo_pagamento
GROUP BY cl.id, cl.razao_social
ORDER BY valor_em_atraso DESC;
```

### Eficiência de Aprovação por Cliente
```sql
SELECT 
    cl.razao_social,
    COUNT(sr.id) AS total_solicitacoes,
    SUM(CASE WHEN sr.status = 'Aprovada' THEN 1 ELSE 0 END) AS aprovadas_integrais,
    SUM(CASE WHEN sr.status = 'Parcialmente Aprovada' THEN 1 ELSE 0 END) AS aprovadas_parciais,
    SUM(CASE WHEN sr.status = 'Rejeitada' THEN 1 ELSE 0 END) AS rejeitadas,
    ROUND(AVG(sr.valor_aprovado / sr.valor_solicitado * 100), 2) AS perc_medio_aprovacao,
    ROUND(AVG(DATEDIFF(sr.data_resposta, sr.data_solicitacao)), 0) AS dias_medio_resposta
FROM clientes cl
INNER JOIN solicitacoes_reembolso sr ON cl.id IN (
    SELECT cliente_id FROM ctes WHERE id = sr.cte_id
)
WHERE sr.status != 'Pendente'
GROUP BY cl.id, cl.razao_social
ORDER BY perc_medio_aprovacao DESC;
```

---

## 🚨 Alertas e Monitoramento

### Criar View de Alertas
```sql
CREATE VIEW vw_alertas AS
SELECT 
    'CRÍTICO' AS nivel,
    CONCAT('CT-e ', c.numero_cte, ' - ', DATEDIFF(CURRENT_DATE, c.data_pagamento), ' dias sem recebimento') AS alerta,
    c.numero_cte,
    cl.razao_social AS cliente,
    c.valor_pago_motorista AS valor,
    DATEDIFF(CURRENT_DATE, c.data_pagamento) AS dias
FROM ctes c
INNER JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
WHERE r.id IS NULL 
  AND DATEDIFF(CURRENT_DATE, c.data_pagamento) > 60

UNION ALL

SELECT 
    'ATENÇÃO' AS nivel,
    CONCAT('CT-e ', c.numero_cte, ' - Sem solicitação criada há ', DATEDIFF(CURRENT_DATE, c.data_pagamento), ' dias') AS alerta,
    c.numero_cte,
    cl.razao_social AS cliente,
    c.valor_pago_motorista AS valor,
    DATEDIFF(CURRENT_DATE, c.data_pagamento) AS dias
FROM ctes c
INNER JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
WHERE sr.id IS NULL 
  AND DATEDIFF(CURRENT_DATE, c.data_pagamento) > 7

UNION ALL

SELECT 
    'AVISO' AS nivel,
    CONCAT('Solicitação ', sr.id, ' - Pendente há ', DATEDIFF(CURRENT_DATE, sr.data_solicitacao), ' dias') AS alerta,
    c.numero_cte,
    cl.razao_social AS cliente,
    sr.valor_solicitado AS valor,
    DATEDIFF(CURRENT_DATE, sr.data_solicitacao) AS dias
FROM solicitacoes_reembolso sr
INNER JOIN ctes c ON sr.cte_id = c.id
INNER JOIN clientes cl ON c.cliente_id = cl.id
WHERE sr.status = 'Pendente'
  AND DATEDIFF(CURRENT_DATE, sr.data_solicitacao) > 30
ORDER BY dias DESC;

-- Consultar alertas
SELECT * FROM vw_alertas ORDER BY nivel, dias DESC;
```

---

## 📈 Relatórios Executivos

### Resultado Consolidado por Período
```sql
SELECT 
    YEAR(c.data_emissao) AS ano,
    QUARTER(c.data_emissao) AS trimestre,
    COUNT(*) AS total_operacoes,
    SUM(c.valor_pago_motorista) AS total_investido,
    SUM(COALESCE(r.valor_recebido, 0)) AS total_retornado,
    SUM(COALESCE(r.valor_recebido, 0)) - SUM(c.valor_pago_motorista) AS resultado,
    ROUND((SUM(COALESCE(r.valor_recebido, 0)) - SUM(c.valor_pago_motorista)) / SUM(c.valor_pago_motorista) * 100, 2) AS roi_percentual
FROM ctes c
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
GROUP BY YEAR(c.data_emissao), QUARTER(c.data_emissao)
ORDER BY ano DESC, trimestre DESC;
```

### Taxa de Conversão (Pago vs Recebido)
```sql
SELECT 
    DATE_FORMAT(c.data_pagamento, '%Y-%m') AS mes,
    COUNT(*) AS operacoes_mes,
    SUM(c.valor_pago_motorista) AS valor_pago,
    COUNT(r.id) AS operacoes_recebidas,
    SUM(r.valor_recebido) AS valor_recebido,
    ROUND(COUNT(r.id) / COUNT(*) * 100, 2) AS taxa_conversao_qtd,
    ROUND(SUM(COALESCE(r.valor_recebido, 0)) / SUM(c.valor_pago_motorista) * 100, 2) AS taxa_conversao_valor
FROM ctes c
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
WHERE c.data_pagamento >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(c.data_pagamento, '%Y-%m')
ORDER BY mes DESC;
```

---

## 🛠️ Manutenção e Utilitários

### Recalcular Conciliações (caso necessário)
```sql
-- Útil após correção de dados
UPDATE conciliacoes con
INNER JOIN ctes c ON con.cte_id = c.id
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
SET 
    con.valor_recebido = r.valor_recebido,
    con.data_recebimento = r.data_recebimento,
    con.diferenca = COALESCE(r.valor_recebido, 0) - c.valor_pago_motorista,
    con.percentual_diferenca = ROUND((COALESCE(r.valor_recebido, 0) - c.valor_pago_motorista) / c.valor_pago_motorista * 100, 2),
    con.dias_para_receber = DATEDIFF(r.data_recebimento, c.data_pagamento);
```

### Exportar para Análise
```sql
-- Dados completos para Excel/BI
SELECT 
    c.numero_cte,
    c.data_emissao,
    c.data_pagamento,
    cl.razao_social AS cliente,
    m.nome AS motorista,
    c.origem,
    c.destino,
    c.quantidade_diarias,
    c.valor_por_diaria,
    c.valor_pago_motorista,
    sr.data_solicitacao,
    sr.valor_solicitado,
    sr.status AS status_solicitacao,
    sr.valor_aprovado,
    sr.data_resposta,
    sr.motivo_divergencia,
    r.data_recebimento,
    r.valor_recebido,
    con.diferenca AS resultado,
    con.percentual_diferenca,
    con.dias_para_receber,
    con.status_financeiro
FROM ctes c
INNER JOIN clientes cl ON c.cliente_id = cl.id
INNER JOIN motoristas m ON c.motorista_id = m.id
LEFT JOIN solicitacoes_reembolso sr ON c.id = sr.cte_id
LEFT JOIN recebimentos r ON sr.id = r.solicitacao_reembolso_id
LEFT JOIN conciliacoes con ON c.id = con.cte_id
ORDER BY c.data_emissao DESC;
```

---

## 🎓 Boas Práticas

1. **Sempre registre o CT-e com o pagamento junto** - É 1:1, então faz sentido registrar tudo de uma vez
2. **Use a procedure para criar solicitações** - Evita erros e garante consistência
3. **Documente divergências** - Sempre preencha o campo `motivo_divergencia`
4. **Monitore os alertas** - Consulte `vw_alertas` diariamente
5. **Faça backup antes de alterações** - Principalmente nas tabelas críticas
6. **Revise pendências semanalmente** - Use `vw_pendencias`
7. **Analise clientes mensalmente** - Use `vw_analise_por_cliente`