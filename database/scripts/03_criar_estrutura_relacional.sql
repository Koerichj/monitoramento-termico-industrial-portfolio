CREATE SEQUENCE public.dispositivo_cd_dispositivo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.dispositivo (
    cd_dispositivo integer NOT NULL,

    ds_dispositivo character varying(100) NOT NULL,

    ds_tipo character varying(50) NOT NULL,

    ds_ip character varying(50),

    fg_ativo boolean DEFAULT true NOT NULL,

    dt_cadastro timestamp without time zone
        DEFAULT now()
        NOT NULL
);


ALTER SEQUENCE public.dispositivo_cd_dispositivo_seq
    OWNED BY public.dispositivo.cd_dispositivo;


ALTER TABLE ONLY public.dispositivo
    ALTER COLUMN cd_dispositivo
    SET DEFAULT nextval(
        'public.dispositivo_cd_dispositivo_seq'::regclass
    );

ALTER TABLE ONLY public.dispositivo
    ADD CONSTRAINT dispositivo_pkey
    PRIMARY KEY (cd_dispositivo);


CREATE TABLE public.status_operacional (
    cd_status_operacional integer NOT NULL,

    ds_status_operacional character varying(80) NOT NULL,

    ds_descricao character varying(255),

    fg_ativo boolean DEFAULT true NOT NULL
);


ALTER TABLE ONLY public.status_operacional
    ADD CONSTRAINT status_operacional_pkey
    PRIMARY KEY (cd_status_operacional);


CREATE SEQUENCE public.sensor_cd_sensor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.sensor (
    cd_sensor integer NOT NULL,

    cd_dispositivo integer NOT NULL,

    ds_sensor character varying(120) NOT NULL,

    ds_tipo_sensor character varying(80) NOT NULL,

    ds_variavel character varying(80) NOT NULL,

    ds_unidade_medida character varying(20) NOT NULL,

    ds_local_instalacao character varying(150),

    fg_ativo boolean DEFAULT true NOT NULL,

    dt_cadastro timestamp without time zone
        DEFAULT now()
        NOT NULL
);


ALTER SEQUENCE public.sensor_cd_sensor_seq
    OWNED BY public.sensor.cd_sensor;


ALTER TABLE ONLY public.sensor
    ALTER COLUMN cd_sensor
    SET DEFAULT nextval(
        'public.sensor_cd_sensor_seq'::regclass
    );


ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_pkey
    PRIMARY KEY (cd_sensor);


CREATE SEQUENCE public.leitura_processo_cd_leitura_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.leitura_processo (
    cd_leitura integer NOT NULL,

    cd_dispositivo integer NOT NULL,

    cd_status_operacional integer NOT NULL,

    dt_leitura timestamp without time zone
        DEFAULT now()
        NOT NULL,

    nr_temp_entrada numeric(10,2),

    nr_temp_saida numeric(10,2),

    nr_fluxo_l_min numeric(10,2),

    nr_deltat numeric(10,2),

    nr_volume_instante numeric(12,4),

    nr_volume_acumulado numeric(14,4),

    nr_energia_kj numeric(14,4),

    nr_energia_kwh numeric(14,4),

    nr_energia_acumulada numeric(14,4),

    nr_desempenho_termico_percentual numeric(10,2),

    fg_valvula_entrada_aberta boolean,

    fg_valvula_saida_aberta boolean,

    dt_cadastro timestamp without time zone
        DEFAULT now()
        NOT NULL
);


ALTER SEQUENCE public.leitura_processo_cd_leitura_seq
    OWNED BY public.leitura_processo.cd_leitura;


ALTER TABLE ONLY public.leitura_processo
    ALTER COLUMN cd_leitura
    SET DEFAULT nextval(
        'public.leitura_processo_cd_leitura_seq'::regclass
    );


ALTER TABLE ONLY public.leitura_processo
    ADD CONSTRAINT leitura_processo_pkey
    PRIMARY KEY (cd_leitura);


CREATE SEQUENCE public.alerta_cd_alerta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.alerta (
    cd_alerta integer NOT NULL,

    cd_leitura integer NOT NULL,

    ds_tipo_alerta character varying(100) NOT NULL,

    ds_mensagem character varying(255) NOT NULL,

    dt_alerta timestamp without time zone
        DEFAULT now()
        NOT NULL,

    fg_ativo boolean
        DEFAULT true
        NOT NULL
);


ALTER SEQUENCE public.alerta_cd_alerta_seq
    OWNED BY public.alerta.cd_alerta;


ALTER TABLE ONLY public.alerta
    ALTER COLUMN cd_alerta
    SET DEFAULT nextval(
        'public.alerta_cd_alerta_seq'::regclass
    );


ALTER TABLE ONLY public.alerta
    ADD CONSTRAINT alerta_pkey
    PRIMARY KEY (cd_alerta);


ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT fk_sensor_dispositivo
    FOREIGN KEY (cd_dispositivo)
    REFERENCES public.dispositivo(cd_dispositivo);


ALTER TABLE ONLY public.leitura_processo
    ADD CONSTRAINT fk_leitura_dispositivo
    FOREIGN KEY (cd_dispositivo)
    REFERENCES public.dispositivo(cd_dispositivo);


ALTER TABLE ONLY public.leitura_processo
    ADD CONSTRAINT fk_leitura_status
    FOREIGN KEY (cd_status_operacional)
    REFERENCES public.status_operacional(cd_status_operacional);


ALTER TABLE ONLY public.alertas
    ADD CONSTRAINT fk_alerta_leitura
    FOREIGN KEY (cd_leitura)
    REFERENCES public.leitura_processo(cd_leitura);