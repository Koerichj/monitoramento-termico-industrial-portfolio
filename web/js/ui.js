import { formatarNumero, formatarData } from "./utils.js";

const els = {
    apiStatus: document.getElementById("apiStatus"),
    statusOperacional: document.getElementById("statusOperacional"),
    dataAtualizacao: document.getElementById("dataAtualizacao"),
    criticidade: document.getElementById("criticidade"),

    temperaturaEntrada: document.getElementById("temperaturaEntrada"),
    temperaturaSaida: document.getElementById("temperaturaSaida"),
    vazao: document.getElementById("vazao"),
    deltaT: document.getElementById("deltaT"),

    estadoProcesso: document.getElementById("estadoProcesso"),
    statusValidacao: document.getElementById("statusValidacao"),
    origem: document.getElementById("origem"),
    ciclo: document.getElementById("ciclo"),

    volumeTotal: document.getElementById("volumeTotal"),
    energiaTotal: document.getElementById("energiaTotal"),
    economiaReais: document.getElementById("economiaReais"),
    desempenhoTermicoPercentual: document.getElementById("desempenhoTermicoPercentual"),

    observacao: document.getElementById("observacao"),
    condicaoResumo: document.getElementById("condicaoResumo")
};

export function marcarApiOnline(online) {
    els.apiStatus.classList.toggle("offline", !online);
    els.apiStatus.classList.toggle("online", online);
}

export function atualizarIndicadores(d) {
    els.statusOperacional.textContent = d.status_operacional || "Indefinido";
    els.dataAtualizacao.textContent = formatarData(d.timestamp);

    els.temperaturaEntrada.textContent = `${formatarNumero(d.temperatura_entrada)} °C`;
    els.temperaturaSaida.textContent = `${formatarNumero(d.temperatura_saida)} °C`;
    els.vazao.textContent = formatarNumero(d.vazao_l_min);
    els.deltaT.textContent = formatarNumero(d.delta_t);

    els.estadoProcesso.textContent = d.estado_processo || "--";
    els.statusValidacao.textContent = d.status_validacao || "--";
    els.origem.textContent = d.origem || "--";
    els.ciclo.textContent = d.ciclo ?? 0;

    els.volumeTotal.textContent = formatarNumero(d.volume_total_l);
    els.energiaTotal.textContent = formatarNumero(d.energia_total_kwh, 4);
    els.economiaReais.textContent = formatarNumero(d.economia_reais);
    els.desempenhoTermicoPercentual.textContent = formatarNumero(d.desempenho_termico_percentual);

    els.observacao.textContent = d.observacao || "Sem observação.";
    els.condicaoResumo.textContent = `${d.estado_processo || "--"} | ${d.criticidade || "Normal"} | Validação: ${d.status_validacao || "--"}`;

    atualizarCriticidade(d.criticidade);
}

function atualizarCriticidade(criticidade) {
    const texto = criticidade || "Normal";

    els.criticidade.textContent = texto;
    els.criticidade.classList.remove("normal", "alerta", "critica");

    const c = texto.toLowerCase();

    if (c.includes("crítica") || c.includes("critica")) {
        els.criticidade.classList.add("critica");
    } else if (c.includes("atenção") || c.includes("atencao")) {
        els.criticidade.classList.add("alerta");
    } else {
        els.criticidade.classList.add("normal");
    }
}
