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



CREATE TABLE IF NOT EXISTS public."Diaria"
(
    id integer NOT NULL DEFAULT nextval('"Diaria_id_seq"'::regclass),
    emp_codigo character varying(3) COLLATE pg_catalog."default" NOT NULL,
    cte integer NOT NULL,
    serie character varying(1) COLLATE pg_catalog."default",
    cte_complementar integer,
    motorista_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    nome_motorista character varying(40) COLLATE pg_catalog."default" NOT NULL,
    dt character varying(10) COLLATE pg_catalog."default",
    data_emissao date NOT NULL,
    data_entrega date NOT NULL,
    data_baixa date,
    qtde_diaria_paga smallint NOT NULL,
    valor_diaria_paga numeric(13,2) NOT NULL DEFAULT 0,
    total_diaria_paga numeric(13,2) NOT NULL DEFAULT 0,
    qtde_diaria_recebida smallint DEFAULT 0,
    valor_diaria_recebida numeric(13,2) DEFAULT 0,
    total_diaria_recebida numeric(13,2) DEFAULT 0,
    saldo numeric(13,2) DEFAULT 0,
    baixado boolean NOT NULL DEFAULT false,
    criado_em timestamp with time zone,
    excluido_em timestamp without time zone,
    usuario character varying(15) COLLATE pg_catalog."default",
    supervisor character varying(15) COLLATE pg_catalog."default",
    CONSTRAINT "Diaria_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Diaria"
    OWNER to postgres;