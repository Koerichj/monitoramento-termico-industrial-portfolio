// F7 - PREPARAR REGISTRO FINAL

// Objetivo:
// Organizar todos os dados finais em um único payload

let d = msg.payload || {};

// 1. Verificar se os dados passaram pela classificação
if (d.classificado !== true) {
    node.warn("Dados não passaram pela etapa de classificação");
    return null;
}

// 2. Montagem do registro final
msg.payload = {

    // Identificação
    origem: d.origem,
    timestamp: d.timestamp,
    ciclo: d.ciclo,

    // Estado do processo
    estado_processo: d.estado_processo,
    status_operacional: d.status_operacional,

    // Temperaturas
    temperatura_entrada: d.temperatura_entrada,
    temperatura_saida: d.temperatura_saida,
    delta_t: d.delta_t,

    // Vazão e volume
    vazao_l_min: d.vazao_l_min,
    volume_instante_l: d.volume_instante_l,
    volume_total_l: d.volume_total_l,

    // Válvulas e processo
    valvula_entrada: d.valvula_entrada,
    valvula_saida: d.valvula_saida,
    nivel_tubulacao_percentual: d.nivel_tubulacao_percentual,
    tempo_maturacao_min: d.tempo_maturacao_min,

    // Energia
    energia_kj: d.energia_kj,
    energia_kwh: d.energia_kwh,
    energia_total_kwh: d.energia_total_kwh,

    // Desempenho térmico
    desempenho_termico_percentual: d.desempenho_termico_percentual,
    economia_reais: d.economia_reais,

    // Classificações
    condicao_termica: d.condicao_termica,
    condicao_transferencia: d.condicao_transferencia,
    faixa_desempenho_termico: d.faixa_desempenho_termico,
    status_valvulas: d.status_valvulas,
    criticidade: d.criticidade,

    // Dados auxiliares
    fator_solar: d.fator_solar,
    observacao: d.observacao,

    // Validação
    validado: d.validado,
    status_validacao: d.status_validacao,
    alertas: d.alertas || []
};


// 3. Status visual
node.status({
    fill: "grey",
    shape: "ring",
    text: "Registro final preparado"
});

return msg;