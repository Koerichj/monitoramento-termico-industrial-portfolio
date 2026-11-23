import { formatarHorario, formatarNumero } from "./utils.js";

const canvas = document.getElementById("graficoHistorico");
let ctx;
if (canvas) {
    ctx = canvas.getContext("2d");
}

let dadosGlobais = [];
let hoverIndex = -1;
let mouseX = -1;
let mouseY = -1;

if (canvas) {
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        render();
    });

    canvas.addEventListener("mouseleave", () => {
        mouseX = -1;
        mouseY = -1;
        hoverIndex = -1;
        render();
    });
}

export function atualizarGrafico(dados) {
    if (!canvas) return;
    dadosGlobais = dados || [];
    render();
}

function render() {
    if (!canvas) return;

    const largura = canvas.clientWidth;
    const altura = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, largura, altura);

    if (dadosGlobais.length === 0) {
        ctx.fillStyle = "#91a3bd";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Sem dados históricos para exibir.", largura / 2, altura / 2);
        return;
    }

    const paddingX = 60;
    const paddingY = 40;
    const rightPadding = 20;
    const topPadding = 50;

    const areaW = largura - paddingX - rightPadding;
    const areaH = altura - paddingY - topPadding;

    const valoresLimpos = [];
    dadosGlobais.forEach(d => {
        if (d.temperatura_entrada !== null && d.temperatura_entrada !== undefined) {
            valoresLimpos.push(Number(d.temperatura_entrada));
        }
        if (d.temperatura_saida !== null && d.temperatura_saida !== undefined) {
            valoresLimpos.push(Number(d.temperatura_saida));
        }
    });

    let min = 0;
    let max = 100;
    if (valoresLimpos.length > 0) {
        min = Math.floor(Math.min(...valoresLimpos) / 5) * 5;
        max = Math.ceil(Math.max(...valoresLimpos) / 5) * 5 + 5;
    }
    if (min === max) {
        min -= 5;
        max += 5;
    }

    const x = i => paddingX + (areaW / Math.max(dadosGlobais.length - 1, 1)) * i;
    const y = v => topPadding + areaH - ((v - min) / (max - min)) * areaH;

    hoverIndex = -1;
    if (mouseX >= paddingX && mouseX <= largura - rightPadding && mouseY >= topPadding && mouseY <= altura - paddingY) {
        let minDist = Infinity;
        dadosGlobais.forEach((_, i) => {
            const px = x(i);
            const dist = Math.abs(px - mouseX);
            if (dist < minDist && dist < 30) {
                minDist = dist;
                hoverIndex = i;
            }
        });
    }

    desenharGrade(largura, altura, paddingX, paddingY, topPadding, rightPadding, min, max);
    desenharLegenda(largura, rightPadding);
    desenharEixoX(areaW, paddingX, altura - paddingY, x);

    const entrada = dadosGlobais.map(d => d.temperatura_entrada !== null && d.temperatura_entrada !== undefined ? Number(d.temperatura_entrada) : null);
    const saida = dadosGlobais.map(d => d.temperatura_saida !== null && d.temperatura_saida !== undefined ? Number(d.temperatura_saida) : null);

    desenharLinhaEPontos(entrada, x, y, "#38bdf8");
    desenharLinhaEPontos(saida, x, y, "#fb923c");

    if (hoverIndex !== -1) {
        desenharTooltip(hoverIndex, x, y, largura, rightPadding, topPadding, altura, paddingY);
    }
}

function desenharGrade(w, h, pX, pY, pTop, pRight, minVal, maxVal) {
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#91a3bd";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    const areaH = h - pY - pTop;
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
        const val = minVal + (maxVal - minVal) * (i / steps);
        const py = pTop + areaH - (i / steps) * areaH;

        ctx.beginPath();
        ctx.moveTo(pX, py);
        ctx.lineTo(w - pRight, py);
        ctx.stroke();

        ctx.fillText(val.toFixed(0), pX - 10, py);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Temperatura (°C)", pX + 40, pTop - 15);
}

function desenharLegenda(w, pRight) {
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const textSaida = "Temperatura de Saída";
    const textEntrada = "Temperatura de Entrada";

    const wSaida = ctx.measureText(textSaida).width;
    const wEntrada = ctx.measureText(textEntrada).width;

    const startX = w - pRight - wSaida - 20 - wEntrada - 20;

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(startX, 15, 10, 10);
    ctx.fillStyle = "#91a3bd";
    ctx.fillText(textEntrada, startX + 15, 20);

    ctx.fillStyle = "#fb923c";
    ctx.fillRect(startX + wEntrada + 30, 15, 10, 10);
    ctx.fillStyle = "#91a3bd";
    ctx.fillText(textSaida, startX + wEntrada + 30 + 15, 20);
}

function desenharEixoX(aW, pX, basePy, xFunc) {
    ctx.fillStyle = "#91a3bd";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const totalPoints = dadosGlobais.length;
    if (totalPoints === 0) return;

    const intervaloMinutos = 10;
    const intervaloMs = intervaloMinutos * 60 * 1000;

    let ultimoTimestampExibido = null;

    dadosGlobais.forEach((d, i) => {
        const timestampAtual = new Date(d.timestamp).getTime();

        if (!Number.isFinite(timestampAtual)) {
            return;
        }

        if (ultimoTimestampExibido === null) {
            ctx.fillText(
                formatarHorario(d.timestamp),
                xFunc(i),
                basePy + 10
            );
            ultimoTimestampExibido = timestampAtual;
            return;
        }

        if (timestampAtual - ultimoTimestampExibido >= intervaloMs) {
            ctx.fillText(
                formatarHorario(d.timestamp),
                xFunc(i),
                basePy + 10
            );
            ultimoTimestampExibido = timestampAtual;
        }
    });
}

function desenharLinhaEPontos(valores, xFunc, yFunc, cor) {
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = cor;

    ctx.beginPath();
    let first = true;
    valores.forEach((valor, i) => {
        if (valor === null) return;
        const px = xFunc(i);
        const py = yFunc(valor);
        if (first) {
            ctx.moveTo(px, py);
            first = false;
        } else {
            ctx.lineTo(px, py);
        }
    });
    ctx.stroke();

    valores.forEach((valor, i) => {
        if (valor === null) return;
        const px = xFunc(i);
        const py = yFunc(valor);
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function desenharTooltip(idx, xFunc, yFunc, w, pRight, pTop, h, pY) {
    const d = dadosGlobais[idx];
    const px = xFunc(idx);

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, pTop);
    ctx.lineTo(px, h - pY);
    ctx.stroke();

    const tIn = d.temperatura_entrada;
    const tOut = d.temperatura_saida;

    if (tIn !== null && tIn !== undefined) {
        ctx.beginPath();
        ctx.fillStyle = "#38bdf8";
        ctx.arc(px, yFunc(tIn), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    }
    if (tOut !== null && tOut !== undefined) {
        ctx.beginPath();
        ctx.fillStyle = "#fb923c";
        ctx.arc(px, yFunc(tOut), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    }

    const boxW = 190;
    const boxH = 75;

    let boxX = px + 12;
    let boxY = (h / 2) - (boxH / 2);

    if (boxX + boxW > w - pRight) {
        boxX = px - boxW - 12;
    }

    ctx.fillStyle = "rgba(15,23,42,0.95)";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    } else {
        ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#eaf2ff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`Horário: ${formatarHorario(d.timestamp)}`, boxX + 12, boxY + 12);

    ctx.font = "12px Arial";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`Entrada: ${tIn !== null ? formatarNumero(tIn) + ' °C' : '--'}`, boxX + 12, boxY + 34);

    ctx.fillStyle = "#fb923c";
    ctx.fillText(`Saída: ${tOut !== null ? formatarNumero(tOut) + ' °C' : '--'}`, boxX + 12, boxY + 52);
}
