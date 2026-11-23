// F4 - VALIDAR DADOS

// Objetivo:
// Verificar se os dados normalizados possuem valores válidos
// e se atendem às regras definidas para o processo.

let d = msg.payload || {};
let alertas = [];
let status_validacao = "OK";

// FUNÇÃO AUXILIAR

// Mantém a prioridade:
function atualizarStatus(novoStatus) {
    const prioridade = {
        OK: 0,
        ALERTA: 1,
        ERRO: 2,
    };

    if (prioridade[novoStatus] > prioridade[status_validacao]) {
        status_validacao = novoStatus;
    }
}

// 1. VERIFICAR NORMALIZAÇÃO
if (d.normalizado !== true) {
    alertas.push("Dados não passaram pela etapa de normalização");
    atualizarStatus("ERRO");
}

// 2. VERIFICAR CAMPOS OBRIGATÓRIOS
if (!d.origem || d.origem === "desconhecida") {
    alertas.push("Origem dos dados não informada");
    atualizarStatus("ERRO");
}

if (!d.timestamp || Number.isNaN(Date.parse(d.timestamp))) {
    alertas.push("Timestamp inválido");
    atualizarStatus("ERRO");
}

if (!d.estado_processo || d.estado_processo === "INDEFINIDO") {
    alertas.push("Estado do processo não informado");
    atualizarStatus("ERRO");
}

// 3. VERIFICAR CAMPOS NUMÉRICOS
if (!Number.isFinite(d.temperatura_entrada)) {
    alertas.push("Temperatura de entrada inválida");
    atualizarStatus("ERRO");
}

if (!Number.isFinite(d.temperatura_saida)) {
    alertas.push("Temperatura de saída inválida");
    atualizarStatus("ERRO");
}

if (!Number.isFinite(d.vazao_l_min)) {
    alertas.push("Vazão inválida");
    atualizarStatus("ERRO");
}

if (!Number.isFinite(d.nivel_tubulacao_percentual)) {
    alertas.push("Nível da tubulação inválido");
    atualizarStatus("ERRO");
}

if (!Number.isFinite(d.tempo_maturacao_min)) {
    alertas.push("Tempo de maturação inválido");
    atualizarStatus("ERRO");
}

if (!Number.isFinite(d.ciclo)) {
    alertas.push("Número do ciclo inválido");
    atualizarStatus("ERRO");
}

// Ciclo deve ser um número inteiro.
if (Number.isFinite(d.ciclo) && !Number.isInteger(d.ciclo)) {
    alertas.push("Número do ciclo deve ser inteiro");
    atualizarStatus("ERRO");
}

// 4. APLICAR LIMITES
if (Number.isFinite(d.temperatura_entrada) && (d.temperatura_entrada < 0 || d.temperatura_entrada > 100)) {
    alertas.push("Temperatura de entrada fora da faixa esperada");
    atualizarStatus("ALERTA");
}

if (Number.isFinite(d.temperatura_saida) && (d.temperatura_saida < 0 || d.temperatura_saida > 110)) {
    alertas.push("Temperatura de saída fora da faixa esperada");
    atualizarStatus("ALERTA");
}

if (Number.isFinite(d.vazao_l_min) && (d.vazao_l_min < 0 || d.vazao_l_min > 100)) {
    alertas.push("Vazão fora da faixa esperada");
    atualizarStatus("ALERTA");
}

if (Number.isFinite(d.nivel_tubulacao_percentual) && (d.nivel_tubulacao_percentual < 0 || d.nivel_tubulacao_percentual > 100)) {
    alertas.push("Nível da tubulação fora da faixa de 0% a 100%");
    atualizarStatus("ALERTA");
}

if (Number.isFinite(d.tempo_maturacao_min) && d.tempo_maturacao_min < 0) {
    alertas.push("Tempo de maturação negativo");
    atualizarStatus("ALERTA");
}

if (Number.isFinite(d.ciclo) && d.ciclo < 0) {
    alertas.push("Número do ciclo negativo");
    atualizarStatus("ALERTA");
}

// O fator solar é opcional.
// Quando informado, deve estar entre 0 e 1.

if (d.fator_solar !== null && (!Number.isFinite(d.fator_solar) || d.fator_solar < 0 || d.fator_solar > 1)) {
    alertas.push("Fator solar fora da faixa de 0 a 1");
    atualizarStatus("ALERTA");
}

// 5. VALIDAR ESTADOS OPERACIONAIS
const estados_validos = [
    "RECARREGANDO",
    "AQUECENDO",
    "MATURANDO",
    "TRANSFERINDO",
];

if (d.estado_processo && d.estado_processo !== "INDEFINIDO" && !estados_validos.includes(d.estado_processo)) {
    alertas.push("Estado do processo desconhecido");
    atualizarStatus("ALERTA");
}

// 6. VALIDAR ESTADO DAS VÁLVULAS
if (d.valvula_entrada === "Indefinida") {
    alertas.push("Estado da válvula de entrada indefinido");
    atualizarStatus("ALERTA");
}

if (d.valvula_saida === "Indefinida") {
    alertas.push("Estado da válvula de saída indefinido");
    atualizarStatus("ALERTA");
}

// 7. REGRAS DE CONSISTÊNCIA DO PROCESSO

// RECARREGANDO:
// entrada aberta e saída fechada.
if (d.estado_processo === "RECARREGANDO" && (d.valvula_entrada !== "Aberta" || d.valvula_saida !== "Fechada")) {
    alertas.push("Configuração das válvulas incompatível com o estado RECARREGANDO",);
    atualizarStatus("ALERTA");
}

// AQUECENDO:
// ambas as válvulas devem estar fechadas.
if (d.estado_processo === "AQUECENDO" && (d.valvula_entrada !== "Fechada" || d.valvula_saida !== "Fechada")) {
    alertas.push("Configuração das válvulas incompatível com o estado AQUECENDO");
    atualizarStatus("ALERTA");
}

// MATURANDO:
// ambas as válvulas devem estar fechadas.
if (d.estado_processo === "MATURANDO" && (d.valvula_entrada !== "Fechada" || d.valvula_saida !== "Fechada")) {
    alertas.push("Configuração das válvulas incompatível com o estado MATURANDO");
    atualizarStatus("ALERTA");
}

// TRANSFERINDO:
// ambas as válvulas devem estar abertas.
if (d.estado_processo === "TRANSFERINDO" && (d.valvula_entrada !== "Aberta" || d.valvula_saida !== "Aberta")) {
    alertas.push("Configuração das válvulas incompatível com o estado TRANSFERINDO",);
    atualizarStatus("ALERTA");
}

// Não deve existir fluxo durante AQUECENDO ou MATURANDO.
if (Number.isFinite(d.vazao_l_min) && (d.estado_processo === "AQUECENDO" || d.estado_processo === "MATURANDO") && d.vazao_l_min > 0.5) {
    alertas.push("Fluxo detectado em estado sem transferência");
    atualizarStatus("ALERTA");
}

// Durante TRANSFERINDO deve existir vazão.

if (Number.isFinite(d.vazao_l_min) && d.estado_processo === "TRANSFERINDO" && d.vazao_l_min <= 0.5) {
    alertas.push("Transferência sem vazão detectada");
    atualizarStatus("ALERTA");
}

// Verifica possível perda térmica.

if (Number.isFinite(d.temperatura_entrada) && Number.isFinite(d.temperatura_saida) && d.temperatura_saida < d.temperatura_entrada) {
    alertas.push("Temperatura de saída menor que temperatura de entrada");
    atualizarStatus("ALERTA");
}

// 8. MONTAGEM DO PAYLOAD VALIDADO
d.validado = status_validacao !== "ERRO";
d.status_validacao = status_validacao;
d.alertas = alertas;
msg.payload = d;

// 9. STATUS VISUAL DO NÓ
let cor = "green";

if (status_validacao === "ALERTA") {
    cor = "yellow";
}

if (status_validacao === "ERRO") {
    cor = "red";
}

node.status({
    fill: cor,
    shape: "dot",
    text: `${status_validacao} | ${alertas.length} alerta(s)`,
});

// 10. BLOQUEIO DE ERROS CRÍTICOS
if (status_validacao === "ERRO") {
    node.warn(alertas.join(" | "));

    return null;
}

return msg;