// F5 - CALCULAR INDICADORES

// Objetivo:
// Calcular os principais indicadores do processo:
// delta_t, volume, energia e economia.

let d = msg.payload || {};

// 1. Veficar validação do F4
if (d.validado !== true) {
    node.warn("Dados não passaram pela etapa de validação");
    return null;
}

// 2. Constantes do processo
const calor_especifico_agua_kj = 4.18;   // kJ/kg°C
const litros_para_kg = 1;                 // 1 litro de água ≈ 1 kg
const intervalo_min = 1;                  // intervalo do inject em minutos
const delta_t_referencia = 15;            // referência para desempenho térmico percentual
const tarifa_recebida = Number(msg.preco_kwh);

const preco_kwh = Number.isFinite(tarifa_recebida) && tarifa_recebida > 0
    ? tarifa_recebida
    : 0.52;

// 3. Recuperação dos dados recebidos
let temperatura_entrada = d.temperatura_entrada;
let temperatura_saida = d.temperatura_saida;
let vazao_l_min = d.vazao_l_min;

// 4. Cálculo do Delta T
let delta_t = temperatura_saida - temperatura_entrada;

// valores negativos são considerados zero.
if (delta_t < 0) {
    delta_t = 0;
}


// 5. Cálculo do volume do instante
let volume_instante_l = vazao_l_min * intervalo_min;

// Desconsidera volumes residuais muito pequenos
if (volume_instante_l < 0.05) {
    volume_instante_l = 0;
}


// 6. Controle de reset diário
let data = new Date();

//ANO-MES-DIA
let data_hoje =
    data.getFullYear() + "-" +
    String(data.getMonth() + 1).padStart(2, "0") + "-" +
    String(data.getDate()).padStart(2, "0");

let ultima_data = context.get("ultima_data") ?? data_hoje;
let volume_total_l = context.get("volume_total_l") ?? 0;
let energia_total_kwh = context.get("energia_total_kwh") ?? 0;

if (ultima_data !== data_hoje) {
    volume_total_l = 0;
    energia_total_kwh = 0;
}


// 7. Acúmulo do volume
volume_total_l += volume_instante_l;


//----------------------------------------------------
// 8. Cálculo da energia
// Fórmula: Q = m * c * ΔT
// m = massa da água em kg
// c = calor específico da água
// ΔT = diferença de temperatura
//----------------------------------------------------

let massa_kg = volume_instante_l * litros_para_kg;
let energia_kj = 0;

if (vazao_l_min > 0.5 && delta_t > 0) {
    energia_kj = massa_kg * calor_especifico_agua_kj * delta_t;
}

let energia_kwh = energia_kj / 3600;


// 9. Acúmulo da energia
energia_total_kwh += energia_kwh;


// 10. Indicador Percentual
let desempenho_termico_percentual = (delta_t / delta_t_referencia) * 100;

if (desempenho_termico_percentual > 100) {
    desempenho_termico_percentual = 100;
}

if (desempenho_termico_percentual < 0) {
    desempenho_termico_percentual = 0;
}

let economia_reais = energia_total_kwh * preco_kwh;


// 11. Atualização do payload
d.delta_t = Number(delta_t.toFixed(2));
d.volume_instante_l = Number(volume_instante_l.toFixed(3));
d.volume_total_l = Number(volume_total_l.toFixed(2));
d.energia_kj = Number(energia_kj.toFixed(2));
d.energia_kwh = Number(energia_kwh.toFixed(5));
d.energia_total_kwh = Number(energia_total_kwh.toFixed(5));
d.desempenho_termico_percentual = Number(desempenho_termico_percentual.toFixed(2));
d.economia_reais = Number(economia_reais.toFixed(2));
d.processado = true;

msg.payload = d;


// 12. Salvamento do contexto
context.set("ultima_data", data_hoje);
context.set("volume_total_l", volume_total_l);
context.set("energia_total_kwh", energia_total_kwh);


// 13. Status visual do nó
node.status({
    fill: "green",
    shape: "dot",
    text: `ΔT ${d.delta_t}°C | ${d.energia_total_kwh} kWh`
});

return msg;