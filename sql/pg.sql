CREATE SEQUENCE IF NOT EXISTS diaria_id_seq;
CREATE SEQUENCE IF NOT EXISTS diaria_recebimento_id_seq;

CREATE TABLE IF NOT EXISTS diaria
(
    id bigint NOT NULL DEFAULT nextval('"diaria_id_seq"'::regclass),
    emp_codigo varchar(3) not null,
    cte integer not null,
    serie varchar(1),
    cte_complementar integer,
    motorista_id integer,
    prontuario varchar(10) not null,
    nome_motorista varchar(40) not null,
    dt varchar(10),
    data_emissao date not null,
    data_entrega date not null,
    qtde_diaria smallint not null default 1,
    valor_diaria numeric(13,2) not null default 0,
    total_diaria numeric(13,2) not null default 0, 
    data_baixa date,
    baixado boolean not null default false,
    criado_em timestamp with time zone default current_timestamp,
    excluido_em timestamp without time zone,
    usuario varchar(15),
    supervisor varchar(15),
    CONSTRAINT diaria_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS diaria_recebimento (
    id bigint NOT NULL DEFAULT nextval('"diaria_recebimento_id_seq"'::regclass),
    diaria_id bigint NOT NULL,
    data_recebimento date NOT NULL,
    qtde_diaria smallint DEFAULT 0,
    valor_diaria numeric(13,2) DEFAULT 0,
    total_diaria numeric(13,2) DEFAULT 0,
    criado_em timestamp with time zone DEFAULT current_timestamp,
    observacao varchar(255),
    usuario varchar(15),
    CONSTRAINT diaria_recebimento_pkey PRIMARY KEY (id),
    CONSTRAINT diaria_recebimento_diaria_id_fkey FOREIGN KEY (diaria_id)
        REFERENCES diaria (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);