import { formatarNumero, limitar } from "./utils.js";

const els = {
    pipeMain: document.getElementById("pipeMain"),
    pipeHot: document.getElementById("pipeHot"),

    flowAnimation: document.getElementById("flowAnimation"),
    flowAnimationHot: document.getElementById("flowAnimationHot"),

    valvulaEntrada: document.getElementById("valvulaEntradaVisual"),
    valvulaSaida: document.getElementById("valvulaSaidaVisual"),

    tankFill: document.getElementById("tankFill"),

    fatorSolar: document.getElementById("fatorSolar"),
    sunIcon: document.getElementById("sunIcon"),

    sensorEntrada: document.getElementById("sensorEntradaLed"),
    sensorSaida: document.getElementById("sensorSaidaLed"),

    barraDesempenhoTermico: document.getElementById("barraDesempenhoTermico"),

    alarmSistema: document.getElementById("alarmSistema"),
    alarmTemperatura: document.getElementById("alarmTemperatura"),
    alarmFluxo: document.getElementById("alarmFluxo"),

    stepRecarregando: document.getElementById("stepRecarregando"),
    stepAquecendo: document.getElementById("stepAquecendo"),
    stepMaturando: document.getElementById("stepMaturando"),
    stepTransferindo: document.getElementById("stepTransferindo")
};

export function atualizarScada(dados) {
    atualizarValvulas(dados);
    atualizarFluxo(dados);
    atualizarTubulacao(dados);
    atualizarTanque(dados);
    atualizarSol(dados);
    atualizarSensores(dados);
    atualizarEtapas(dados);
    atualizarAlarmes(dados);
    atualizarBarraDesempenhoTermico(dados);
}

function atualizarValvulas(d) {
    configurarValvula(els.valvulaEntrada, d.valvula_entrada);
    configurarValvula(els.valvulaSaida, d.valvula_saida);
}

function configurarValvula(el, estado) {
    el.classList.remove("open", "closed");
    const valor = String(estado).toLowerCase();
    
    if (valor === "aberta") {
        el.classList.add("open");
    }

    else if (valor === "fechada") {
        el.classList.add("closed");
    }
}

function atualizarFluxo(d) {
    const fluxo = (Number(d.vazao_l_min) > 0.5);
    els.flowAnimation.classList.toggle("active", fluxo);
    els.flowAnimationHot.classList.toggle("active", fluxo);
}

function atualizarTubulacao(d) {
    const estado = String(d.estado_processo).toUpperCase();
    const quente = (estado == "AQUECENDO" || estado == "MATURANDO");
    els.pipeMain.classList.toggle("heating", quente);
    els.pipeHot.classList.toggle("heating", quente);
}

function atualizarTanque(d) {
    const volume = Number(d.volume_total_l);
    const percentual = limitar((volume / 300) * 100, 5, 100);
    els.tankFill.style.height = percentual + "%";
}

function atualizarSol(d) {
    const fator = Number(d.fator_solar || 0);
    els.fatorSolar.innerHTML = "Sol: " + formatarNumero(fator * 100, 0) + "%";
    els.sunIcon.style.opacity = 0.35 + (fator * 0.65);
    els.sunIcon.style.transform = "scale(" + (1 + (fator * 0.35)) + ")";
}

function atualizarSensores(d) {
    els.sensorEntrada.classList.remove("alert");
    els.sensorSaida.classList.remove("alert");

    if (Number(d.temperatura_entrada) > 70) {
        els.sensorEntrada.classList.add("alert");
    }

    if (Number(d.temperatura_saida) > 70) {
        els.sensorSaida.classList.add("alert");
    }

}

function atualizarEtapas(d) {
    limparEtapas();

    const estado = String(d.estado_processo).toUpperCase();

    switch (estado) {
        case "RECARREGANDO":
            els.stepRecarregando.classList.add("active");
            break;

        case "AQUECENDO":
            els.stepAquecendo.classList.add("active");
            break;

        case "MATURANDO":
            els.stepMaturando.classList.add("active");
            break;

        case "TRANSFERINDO":
            els.stepTransferindo.classList.add("active");
            break;
    }
}

function limparEtapas() {
    els.stepRecarregando.classList.remove("active");
    els.stepAquecendo.classList.remove("active");
    els.stepMaturando.classList.remove("active");
    els.stepTransferindo.classList.remove("active");
}

function atualizarAlarmes(d) {
    els.alarmSistema.className = "alarm-item normal";
    els.alarmTemperatura.className = "alarm-item";
    els.alarmFluxo.className = "alarm-item";

    if (Number(d.delta_t) > 15) {
        els.alarmTemperatura.classList.add("warning");
    }
    if (Number(d.vazao_l_min) < 1) {
        els.alarmFluxo.classList.add("danger");
    }
}

function atualizarBarraDesempenhoTermico(d) {
    const desempenho = limitar(Number(d.desempenho_termico_percentual), 0, 100);
    els.barraDesempenhoTermico.style.width = desempenho + "%";
}
