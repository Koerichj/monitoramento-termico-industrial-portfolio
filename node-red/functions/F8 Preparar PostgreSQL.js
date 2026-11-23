// F8 - PREPARAR POSTGRESQL

// Objetivo:
// Preparar a instrução SQL e os parâmetros
// utilizados para persistir o registro final
// no banco de dados PostgreSQL.

msg.query = `
INSERT INTO public.leitura_monitoramento (
    ds_origem,
    dt_registro,

    ds_estado_processo,
    ds_status_operacional,
    nr_ciclo,

    nr_temperatura_entrada,
    nr_temperatura_saida,
    nr_delta_t,

    nr_vazao_l_min,
    nr_volume_instante_l,
    nr_volume_total_l,

    ds_valvula_entrada,
    ds_valvula_saida,
    nr_nivel_tubulacao_percentual,
    nr_tempo_maturacao_min,

    nr_energia_kj,
    nr_energia_kwh,
    nr_energia_total_kwh,

    nr_desempenho_termico_percentual,
    nr_economia_reais,

    ds_condicao_termica,
    ds_condicao_transferencia,
    ds_faixa_desempenho_termico,
    ds_status_valvulas,
    ds_criticidade,

    nr_fator_solar,
    ds_observacao,

    fg_validado,
    ds_status_validacao

)
VALUES (

    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15,
    $16, $17, $18, $19, $20,
    $21, $22, $23, $24, $25,
    $26, $27, $28, $29

);
`;

// Parâmetros correspondentes aos campos do INSERT
msg.params = [

    msg.payload.origem,
    msg.payload.timestamp,

    msg.payload.estado_processo,
    msg.payload.status_operacional,
    msg.payload.ciclo,

    msg.payload.temperatura_entrada,
    msg.payload.temperatura_saida,
    msg.payload.delta_t,

    msg.payload.vazao_l_min,
    msg.payload.volume_instante_l,
    msg.payload.volume_total_l,

    msg.payload.valvula_entrada,
    msg.payload.valvula_saida,
    msg.payload.nivel_tubulacao_percentual,
    msg.payload.tempo_maturacao_min,

    msg.payload.energia_kj,
    msg.payload.energia_kwh,
    msg.payload.energia_total_kwh,

    msg.payload.desempenho_termico_percentual,
    msg.payload.economia_reais,

    msg.payload.condicao_termica,
    msg.payload.condicao_transferencia,
    msg.payload.faixa_desempenho_termico,
    msg.payload.status_valvulas,
    msg.payload.criticidade,

    msg.payload.fator_solar,
    msg.payload.observacao,

    msg.payload.validado,
    msg.payload.status_validacao

];

// Status visual da Function
node.status({
    fill: "blue",
    shape: "dot",
    text: "SQL preparado"
});


return msg;