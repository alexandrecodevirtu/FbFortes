CREATE TABLE RODORRICA_LOG (
    ID BIGINT NOT NULL PRIMARY KEY,
    NOME_TABELA VARCHAR(50) NOT NULL,
    TIPO_OPERACAO CHAR(1) NOT NULL,
    DATA_OPERACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EMP_CODIGO VARCHAR(3) NOT NULL,
    SERIE VARCHAR(1),
    CODIGO INTEGER NOT NULL,
    DATA_REPLICACAO TIMESTAMP,
    REPLICADO CHAR(1) DEFAULT 'N' NOT NULL
);

CREATE SEQUENCE GEN_RODORRICA_LOG;

SET TERM ^ ;
CREATE OR ALTER trigger tg_rodorrica_log for rodorrica_log
active before insert position 0
AS
begin
    IF (NEW.ID IS NULL) THEN
        NEW.ID = NEXT VALUE FOR GEN_RODORRICA_LOG;
end
^
SET TERM ; ^

SET TERM ^ ;
CREATE OR ALTER trigger tg_rodorrica_cnh for cnh
active before insert or update position 0
AS
begin
    if (new.emp_codigo in ('D01', 'D05', 'D06', 'D07', 'D08', 'D11', 'D12', 'D13', 'D14', 'D15', 'D17', 'D19', 'D24', 'D25') and (new.serie <> '*')) then
    begin
        if (inserting) then
        begin
            INSERT INTO RODORRICA_LOG (NOME_TABELA, TIPO_OPERACAO, EMP_CODIGO, SERIE, CODIGO)
            VALUES ('CNH', 'I', NEW.emp_codigo, NEW.serie, NEW.ctrc);
        end
        else
        if (updating) then
        begin
            if (old.serie = '*') then
            begin
                INSERT INTO RODORRICA_LOG (NOME_TABELA, TIPO_OPERACAO, EMP_CODIGO, SERIE, CODIGO)
                VALUES ('CNH', 'I', NEW.emp_codigo, NEW.serie, NEW.ctrc);
            end
            else
            begin
                INSERT INTO RODORRICA_LOG (NOME_TABELA, TIPO_OPERACAO, EMP_CODIGO, SERIE, CODIGO)
                VALUES ('CNH', 'U', NEW.emp_codigo, NEW.serie, NEW.ctrc);
            end
        end
    end
end
^
SET TERM ; ^