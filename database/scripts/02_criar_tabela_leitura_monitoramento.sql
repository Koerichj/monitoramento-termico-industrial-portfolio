CREATE SEQUENCE public.leitura_monitoramento_cd_leitura_monitoramento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.leitura_monitoramento (

    cd_leitura_monitoramento integer NOT NULL,

    ds_origem varchar(30),

    dt_registro timestamptz
        DEFAULT CURRENT_TIMESTAMP
        NOT NULL,

    ds_estado_processo varchar(50),

    ds_status_operacional varchar(50),

    nr_ciclo integer,

    nr_temperatura_entrada numeric(10,2),

    nr_temperatura_saida numeric(10,2),

    nr_delta_t numeric(10,2),

    nr_vazao_l_min numeric(10,2),

    nr_volume_instante_l numeric(12,3),

    nr_volume_total_l numeric(14,2),

    ds_valvula_entrada varchar(20),

    ds_valvula_saida varchar(20),

    nr_nivel_tubulacao_percentual numeric(10,2),

    nr_tempo_maturacao_min numeric(10,2),

    nr_energia_kj numeric(14,2),

    nr_energia_kwh numeric(14,5),

    nr_energia_total_kwh numeric(14,5),

    nr_desempenho_termico_percentual numeric(10,2),

    nr_economia_reais numeric(12,2),

    ds_condicao_termica varchar(50),

    ds_condicao_transferencia varchar(80),

    ds_faixa_desempenho_termico varchar(30),

    ds_status_valvulas varchar(80),

    ds_criticidade varchar(80),

    nr_fator_solar numeric(5,4),

    ds_observacao text,

    fg_validado boolean,

    ds_status_validacao varchar(30),

    dt_cadastro timestamptz
        DEFAULT CURRENT_TIMESTAMP
        NOT NULL
);


ALTER SEQUENCE public.leitura_monitoramento_cd_leitura_monitoramento_seq
    OWNED BY public.leitura_monitoramento.cd_leitura_monitoramento;


ALTER TABLE ONLY public.leitura_monitoramento
    ALTER COLUMN cd_leitura_monitoramento
    SET DEFAULT nextval(
        'public.leitura_monitoramento_cd_leitura_monitoramento_seq'::regclass
    );


ALTER TABLE ONLY public.leitura_monitoramento
    ADD CONSTRAINT leitura_monitoramento_pkey
    PRIMARY KEY (cd_leitura_monitoramento);