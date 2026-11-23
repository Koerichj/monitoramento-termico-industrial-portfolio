// F3 - NORMALIZAR ESTRUTURA

// Objetivo:
// Garantir que os dados vindos do simulador ou do CLP
// tenham sempre o mesmo formato para as próximas etapas.

let d = msg.payload || {};
let data = new Date();


// 1. FUNÇÕES AUXILIARES
// Valores ausentes, vazios ou inválidos são definidos como null.
function normalizarNumero(valor) {

    if (
        valor === null ||
        valor === undefined ||
        (typeof valor === "string" && valor.trim() === "")
    ) {
        return null;
    }

    let numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return null;
    }

    return numero;
}


// Padroniza os valores das válvulas.
function normalizarValvula(valor) {

    valor = String(valor ?? "Indefinida")
        .trim()
        .toLowerCase();

    if (valor === "aberta") {
        return "Aberta";
    }

    if (valor === "fechada") {
        return "Fechada";
    }

    return "Indefinida";
}


// 2. NORMALIZAÇÃO DOS CAMPOS PRINCIPAIS
let origem = String(
    d.origem ||
    msg.origem ||
    "desconhecida"
)
    .trim()
    .toLowerCase();


let timestamp;

if (
    d.timestamp === null ||
    d.timestamp === undefined ||
    d.timestamp === ""
) {
    timestamp = data.toISOString();
} else {
    timestamp = String(d.timestamp).trim();
}


let estado_processo = String(
    d.estado_processo || "INDEFINIDO"
)
    .trim()
    .toUpperCase();


// 3. NORMALIZAÇÃO DOS CAMPOS NUMÉRICOS
let ciclo = normalizarNumero(d.ciclo);

let temperatura_entrada = normalizarNumero(d.temperatura_entrada);

let temperatura_saida = normalizarNumero(d.temperatura_saida);

let vazao_l_min = normalizarNumero(d.vazao_l_min);

let nivel_tubulacao_percentual = normalizarNumero(d.nivel_tubulacao_percentual);

let tempo_maturacao_min = normalizarNumero(d.tempo_maturacao_min);

let fator_solar = normalizarNumero(d.fator_solar);

// 4. NORMALIZAÇÃO DAS VÁLVULAS
let valvula_entrada = normalizarValvula(d.valvula_entrada);

let valvula_saida = normalizarValvula(d.valvula_saida);

// 5. NORMALIZAÇÃO DA OBSERVAÇÃO
let observacao = String(d.observacao || "").trim();


// 6. MONTAGEM DO PAYLOAD NORMALIZADO
msg.payload = {

    origem: origem,
    timestamp: timestamp,
    estado_processo: estado_processo,
    ciclo: ciclo,

    temperatura_entrada: temperatura_entrada,
    temperatura_saida: temperatura_saida,
    vazao_l_min: vazao_l_min,

    valvula_entrada: valvula_entrada,
    valvula_saida: valvula_saida,

    nivel_tubulacao_percentual:
        nivel_tubulacao_percentual,

    tempo_maturacao_min:
        tempo_maturacao_min,

    fator_solar: fator_solar,

    observacao: observacao,

    normalizado: true
};

// 7. STATUS VISUAL DO NÓ
node.status({
    fill: "blue",
    shape: "dot",
    text: `${origem} | ${estado_processo}`
});

return msg;