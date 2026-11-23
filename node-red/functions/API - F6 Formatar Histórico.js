// API - FORMATAR HISTÓRICO

let rows = msg.payload || [];

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


msg.payload = {

    sucesso: true,
    total: rows.length,

    dados: rows.map(d => ({
        timestamp: d.dt_registro,
        temperatura_entrada: numeroOuNull(d.nr_temperatura_entrada),
        temperatura_saida: numeroOuNull(d.nr_temperatura_saida),
        delta_t: numeroOuNull(d.nr_delta_t),
        vazao_l_min: numeroOuNull(d.nr_vazao_l_min),
        energia_total_kwh: numeroOuNull(d.nr_energia_total_kwh),
        desempenho_termico_percentual: numeroOuNull(d.nr_desempenho_termico_percentual),
        economia_reais: numeroOuNull(d.nr_economia_reais),
        criticidade: d.ds_criticidade
    }))
};

return msg;