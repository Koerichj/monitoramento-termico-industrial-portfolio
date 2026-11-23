// F1 - SIMULAR DADOS DO PROCESSO

// Simula o comportamento de um processo de pré-aquecimento
// de água com estados operacionais.


// 1. Parâmetros do processo
const temperatura_minima_liberacao = 36; // 2*temperatura_ambiente
const temperatura_maxima_seguranca = 70; //Suposição
const temperatura_ambiente = 18; //Considerando Alto Vale do Itajaí
const vazao_nominal_l_min = 12; // litros/minutos
const tempo_maturacao_alvo = 20; //minutos


// 2. Recuperação do contexto
let estado_processo = context.get("estado_processo") || "RECARREGANDO";
let temperatura_entrada = context.get("temperatura_entrada") || temperatura_ambiente;
let temperatura_saida = context.get("temperatura_saida") || temperatura_ambiente + 2;
const ciclo = context.get("ciclo") || 1;

// A amostra descreve o estado atual. O contexto prepara a próxima execução.
let proximo_estado = estado_processo;
let proximo_ciclo = ciclo;
let nivel_tubulacao_percentual = context.get("nivel_tubulacao_percentual") || 0;
let tempo_maturacao_min = context.get("tempo_maturacao_min") || 0;


// 3. Simulação do fator solar
let data = new Date();
let hora = data.getHours();
let minuto = data.getMinutes();
let hora_decimal = hora + (minuto / 60);

// Simulação simples da incidência solar
let fator_solar = Math.max(0, Math.sin((hora_decimal - 6) * Math.PI / 12));

// 4. Variáveis de saída
let valvula_entrada = "Fechada";
let valvula_saida = "Fechada";
let vazao_l_min = 0;
let observacao = "";

// 5. Máquina de estados
switch (estado_processo) {

    case "AQUECENDO":
        valvula_entrada = "Fechada";
        valvula_saida = "Fechada";
        vazao_l_min = 0;

        let ganho_temperatura = (fator_solar * 1.5) - 0.05;

        temperatura_entrada += ganho_temperatura * 0.4;
        temperatura_saida += ganho_temperatura * 1.2;

        observacao = "Aquecendo a água na tubulação";

        if (temperatura_saida >= temperatura_minima_liberacao) {
            proximo_estado = "MATURANDO";
            tempo_maturacao_min = 0;
        }
        break;

    case "MATURANDO":
        valvula_entrada = "Fechada";
        valvula_saida = "Fechada";
        vazao_l_min = 0;

        tempo_maturacao_min += 1;
        temperatura_saida += fator_solar * 0.2;

        observacao = "Aguardando estabilização térmica";

        if (tempo_maturacao_min >= tempo_maturacao_alvo) {
            proximo_estado = "TRANSFERINDO";
        }
        break;

    case "TRANSFERINDO":
        valvula_entrada = "Aberta";
        valvula_saida = "Aberta";
        vazao_l_min = vazao_nominal_l_min + (Math.random() - 0.5);

        temperatura_entrada = (temperatura_entrada * 0.5) + (temperatura_ambiente * 0.5);
        temperatura_saida -= 1.5;

        observacao = "Transferindo água aquecida para o tanque";

        if (temperatura_saida < temperatura_minima_liberacao - 5) {
            proximo_estado = "RECARREGANDO";
            nivel_tubulacao_percentual = 80;
            proximo_ciclo += 1;
        }
        break;

    case "RECARREGANDO":
    default:
        estado_processo = "RECARREGANDO";
        proximo_estado = estado_processo;
        valvula_entrada = "Aberta";
        valvula_saida = "Fechada";
        vazao_l_min = vazao_nominal_l_min * 0.8;

        nivel_tubulacao_percentual += 20;

        temperatura_entrada = temperatura_ambiente + Math.random();
        temperatura_saida = (temperatura_saida * 0.6) + (temperatura_entrada * 0.4);

        observacao = "Recarregando tubulação com água nova";

        if (nivel_tubulacao_percentual >= 100) {
            nivel_tubulacao_percentual = 100;
            proximo_estado = "AQUECENDO";
        }
        break;
}

// 6. Travamento de limites físicos
if (temperatura_saida > temperatura_maxima_seguranca) {
    temperatura_saida = temperatura_maxima_seguranca;
}

if (temperatura_entrada < temperatura_ambiente - 2) {
    temperatura_entrada = temperatura_ambiente - 2;
}

if (temperatura_saida < temperatura_entrada) {
    temperatura_saida = temperatura_entrada;
}

if (nivel_tubulacao_percentual > 100) {
    nivel_tubulacao_percentual = 100;
}

// 7. Montagem do payload padronizado
msg.payload = {
    origem: "simulado",
    timestamp: data.toISOString(),
    estado_processo: estado_processo,
    ciclo: ciclo,

    temperatura_entrada: Number(temperatura_entrada.toFixed(2)),
    temperatura_saida: Number(temperatura_saida.toFixed(2)),
    vazao_l_min: Number(vazao_l_min.toFixed(2)),

    valvula_entrada: valvula_entrada,
    valvula_saida: valvula_saida,
    nivel_tubulacao_percentual: Number(nivel_tubulacao_percentual.toFixed(2)),
    tempo_maturacao_min: Number(tempo_maturacao_min.toFixed(0)),

    fator_solar: Number(fator_solar.toFixed(2)),
    observacao: observacao
};

// 8. Salvamento do contexto
context.set("estado_processo", proximo_estado);
context.set("temperatura_entrada", temperatura_entrada);
context.set("temperatura_saida", temperatura_saida);
context.set("ciclo", proximo_ciclo);
context.set("nivel_tubulacao_percentual", nivel_tubulacao_percentual);
context.set("tempo_maturacao_min", tempo_maturacao_min);

// 9. Status visual do nó
node.status({
    fill: "blue",
    shape: "dot",
    text: `${estado_processo} | ${msg.payload.temperatura_saida}°C`
});

return msg;