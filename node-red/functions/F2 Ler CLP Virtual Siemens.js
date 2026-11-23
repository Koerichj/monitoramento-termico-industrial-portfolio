// F2 - LER CLP VIRTUAL SIEMENS

// Dados recebidos do nó responsável pela comunicação
// com o CLP virtual Siemens.

let clp = msg.payload || {};

msg.payload = {

    origem: "clp",
    timestamp: clp.timestamp || new Date().toISOString(),

    estado_processo: clp.estado_processo ?? null,
    ciclo: clp.ciclo ?? null,

    temperatura_entrada: clp.temperatura_entrada ?? null,
    temperatura_saida: clp.temperatura_saida ?? null,
    vazao_l_min: clp.vazao_l_min ?? null,

    valvula_entrada: clp.valvula_entrada ?? null,
    valvula_saida: clp.valvula_saida ?? null,

    nivel_tubulacao_percentual:
        clp.nivel_tubulacao_percentual ?? null,

    tempo_maturacao_min:
        clp.tempo_maturacao_min ?? null,

    fator_solar: clp.fator_solar ?? null,

    observacao:
        clp.observacao || "Dados recebidos do CLP virtual Siemens"
};

node.status({
    fill: "green",
    shape: "dot",
    text: "Dados recebidos do CLP"
});

return msg;