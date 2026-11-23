// F6 - CLASSIFICAR PROCESSO

// Objetivo:
// Classificar o estado operacional do sistema com base
// nos dados processados na etapa anterior.

let d = msg.payload || {};

// 1. Verificar se os dados passaram pela classificação
if (d.processado !== true) {
    node.warn("Dados não passaram pela etapa de processamento");
    return null;
}

// Limitadores
const fluxo_minimo_l_min = 0.5;
const temp_baixa_limite = 35;
const temp_moderada_limite = 45;
const temp_adequada_limite = 60;
const temp_critica = 85;
const temp_minima_transferencia = 40;
const delta_t_baixo = 2;
const eficiencia_media = 30;
const eficiencia_alta = 70;

// 2. Recuperação dos dados principais
let estado = d.estado_processo;
let temperatura_saida = d.temperatura_saida;
let vazao_l_min = d.vazao_l_min;
let delta_t = d.delta_t;
let desempenho_termico_percentual = d.desempenho_termico_percentual;
let valvula_entrada = d.valvula_entrada;
let valvula_saida = d.valvula_saida;

// 3. Status operacional
let status_operacional = "Indefinido";

switch (estado) {
    case "RECARREGANDO":
        status_operacional = "Recarregando";
        break;

    case "AQUECENDO":
        status_operacional = "Aquecendo";
        break;

    case "MATURANDO":
        status_operacional = "Maturando";
        break;

    case "TRANSFERINDO":
        status_operacional = "Transferindo";
        break;

    default:
        status_operacional = "Indefinido";
        break;
}

// 4. Condição térmica
let condicao_termica = "Indefinida";

if (temperatura_saida < temp_baixa_limite) {
    condicao_termica = "Baixa";
}

else if (temperatura_saida < temp_moderada_limite) {
    condicao_termica = "Moderada";
}

else if (temperatura_saida <= temp_adequada_limite) {
    condicao_termica = "Adequada";
}

else {
    condicao_termica = "Elevada";
}

// 5. Condição de transferência
let condicao_transferencia = "Sem fluxo";

if (vazao_l_min > fluxo_minimo_l_min) {
    if (valvula_entrada === "Aberta" && valvula_saida === "Aberta") {
        condicao_transferencia = "Transferindo água";
    }
    else if (valvula_entrada === "Aberta" && valvula_saida === "Fechada") {
        condicao_transferencia = "Recarregando tubulação";
    }
    else {
        condicao_transferencia = "Fluxo em condição incomum";
    }
}

// 6. Faixa de eficiência
let faixa_desempenho_termico = "Baixa";

if (desempenho_termico_percentual >= eficiencia_media && desempenho_termico_percentual < eficiencia_alta) {
    faixa_desempenho_termico = "Média";
}

else if (desempenho_termico_percentual >= eficiencia_alta) {
    faixa_desempenho_termico = "Alta";
}

// 7. Status das válvulas
let status_valvulas = "Indefinido";

if (valvula_entrada === "Fechada" && valvula_saida === "Fechada") {
    status_valvulas = "Ambas fechadas";
}

else if (valvula_entrada === "Aberta" && valvula_saida === "Aberta") {
    status_valvulas = "Ambas abertas";
}

else if (valvula_entrada === "Aberta" && valvula_saida === "Fechada") {
    status_valvulas = "Entrada aberta";
}

else if (valvula_entrada === "Fechada" && valvula_saida === "Aberta") {
    status_valvulas = "Configuração anômala";
}

// 8. Criticidade operacional
let criticidade = "Normal";

if (temperatura_saida > temp_critica) {
    criticidade = "Crítica - Alta temperatura";
}

else if ((estado === "TRANSFERINDO" || estado === "RECARREGANDO") && vazao_l_min <= fluxo_minimo_l_min) {
    criticidade = "Crítica - Falha de fluxo";
}

else if (estado === "TRANSFERINDO" && temperatura_saida < temp_minima_transferencia) {
    criticidade = "Atenção - Perda de calor";
}

else if (delta_t < delta_t_baixo && (estado === "AQUECENDO" || estado === "MATURANDO")) {
    criticidade = "Atenção - Baixo ganho térmico";
}

// 9. Atualização do payload
d.status_operacional = status_operacional;
d.condicao_termica = condicao_termica;
d.condicao_transferencia = condicao_transferencia;
d.faixa_desempenho_termico = faixa_desempenho_termico;
d.status_valvulas = status_valvulas;
d.criticidade = criticidade;
d.classificado = true;

msg.payload = d;

// 10. Status visual do nó
let cor = "green";

if (criticidade.startsWith("Atenção")) {
    cor = "yellow";
}

if (criticidade.startsWith("Crítica")) {
    cor = "red";
}

node.status({
    fill: cor,
    shape: "dot",
    text: `${status_operacional} | ${criticidade}`
});

return msg;