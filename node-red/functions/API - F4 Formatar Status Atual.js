// API - FORMATAR STATUS ATUAL

let rows = msg.payload || [];

// Função auxiliar para campos numéricos
function numeroOuNull(valor) {
    if (
        valor === null ||
        valor === undefined
    ) {
        return null;
    }

    let numero = Number(valor);

    return Number.isFinite(numero)
        ? numero
        : null;
}

if (rows.length === 0) {

    msg.payload = {
        sucesso: false,
        mensagem: "Nenhum registro encontrado"
    };

    return msg;
}

let d = rows[0];

msg.payload = {

    sucesso: true,

    dados: {

        // Identificação
        id: d.cd_leitura_monitoramento,
        origem: d.ds_origem,
        timestamp: d.dt_registro,
        ciclo: d.nr_ciclo,

        // Processo
        estado_processo: d.ds_estado_processo,
        status_operacional: d.ds_status_operacional,

        // Temperaturas
        temperatura_entrada: numeroOuNull(d.nr_temperatura_entrada),
        temperatura_saida: numeroOuNull(d.nr_temperatura_saida),
        delta_t: numeroOuNull(d.nr_delta_t),

        // Vazão e volume
        vazao_l_min:numeroOuNull(d.nr_vazao_l_min),
        volume_instante_l: numeroOuNull(d.nr_volume_instante_l),
        volume_total_l:numeroOuNull(d.nr_volume_total_l),

        // Válvulas e processo
        valvula_entrada: d.ds_valvula_entrada,
        valvula_saida: d.ds_valvula_saida,
        nivel_tubulacao_percentual: numeroOuNull(d.nr_nivel_tubulacao_percentual),
        tempo_maturacao_min: numeroOuNull(d.nr_tempo_maturacao_min),

        // Energia
        energia_kj: numeroOuNull(d.nr_energia_kj),
        energia_kwh: numeroOuNull(d.nr_energia_kwh),
        energia_total_kwh: numeroOuNull(d.nr_energia_total_kwh),

        // Desempenho
        desempenho_termico_percentual: numeroOuNull(d.nr_desempenho_termico_percentual),
        faixa_desempenho_termico: d.ds_faixa_desempenho_termico,
        economia_reais: numeroOuNull(d.nr_economia_reais),

        // Classificações
        condicao_termica: d.ds_condicao_termica,
        condicao_transferencia: d.ds_condicao_transferencia,
        status_valvulas: d.ds_status_valvulas,
        criticidade: d.ds_criticidade,

        // Dados auxiliares
        fator_solar: numeroOuNull(d.nr_fator_solar),
        observacao:d.ds_observacao,

        // Validação
        validado:d.fg_validado,
        status_validacao:d.ds_status_validacao
    }
};


return msg;