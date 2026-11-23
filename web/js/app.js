import { buscarStatusAtual, buscarUltimasLeituras, buscarHistorico } from "./api.js";
import { atualizarIndicadores, marcarApiOnline } from "./ui.js";
import { atualizarScada } from "./scada.js";
import { atualizarTabela } from "./table.js";
import { atualizarGrafico } from "./chart.js";
import { obterDadosDemonstracao } from "./demo.js";

let modoDashboard = "real";
const seletorModo = document.getElementById("seletorModo");
const demoBadge = document.getElementById("demoBadge");

if (seletorModo) {
    seletorModo.addEventListener("change", async (e) => {
        modoDashboard = e.target.value;

        if (modoDashboard === "real") {
            if (demoBadge) demoBadge.style.display = "none";
            await atualizarSistema();
        } else {
            if (demoBadge) demoBadge.style.display = "inline-block";
            const dadosDemo = obterDadosDemonstracao(modoDashboard);
            if (dadosDemo) {
                dadosDemo.timestamp = new Date().toISOString();
                atualizarIndicadores(dadosDemo);
                atualizarScada(dadosDemo);
            }
        }
    });
}

async function atualizarSistema() {
    try {
        const status = await buscarStatusAtual();

        if (status.sucesso && status.dados) {
            if (modoDashboard === "real") {
                atualizarIndicadores(status.dados);
                atualizarScada(status.dados);
            }
        }

        const ultimas = await buscarUltimasLeituras();
        atualizarTabela(ultimas.dados || []);

        const historico = await buscarHistorico();
        atualizarGrafico(historico.dados || []);

        marcarApiOnline(true);

    } catch (erro) {
        console.error("Erro ao atualizar o sistema de monitoramento:", erro);
        marcarApiOnline(false);
    }
}

void atualizarSistema();

setInterval(() => {
    void atualizarSistema();
}, 5000);

window.addEventListener("resize", () => {
    buscarHistorico()
        .then((historico) => {
            atualizarGrafico(historico.dados || []);
        })
        .catch((erro) => {
            console.error("Erro ao atualizar o gráfico:", erro);
        });
});