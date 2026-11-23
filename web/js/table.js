import { formatarNumero, formatarData } from "./utils.js";

const tabela = document.getElementById("tabelaRegistros");
const totalRegistros = document.getElementById("totalRegistros");


function criarCelula(valor) {
    const td = document.createElement("td");

    td.textContent =
        valor === null ||
            valor === undefined ||
            valor === ""
            ? "--"
            : String(valor);

    return td;
}


function criarLinhaSemRegistros() {
    const linha = document.createElement("tr");
    const celula = document.createElement("td");

    celula.colSpan = 7;
    celula.textContent = "Nenhum registro encontrado.";

    linha.appendChild(celula);

    return linha;
}


export function atualizarTabela(registros) {
    if (!tabela || !totalRegistros) {
        return;
    }

    const dados = Array.isArray(registros)
        ? registros
        : [];

    totalRegistros.textContent = `${dados.length} registros`;

    // Remove todas as linhas existentes de forma segura
    tabela.replaceChildren();

    if (dados.length === 0) {
        tabela.appendChild(criarLinhaSemRegistros());
        return;
    }

    const fragmento = document.createDocumentFragment();

    dados.forEach((item) => {
        const linha = document.createElement("tr");

        linha.appendChild(
            criarCelula(formatarData(item.timestamp))
        );

        linha.appendChild(
            criarCelula(item.estado_processo)
        );

        linha.appendChild(
            criarCelula(
                `${formatarNumero(item.temperatura_entrada)} °C`
            )
        );

        linha.appendChild(
            criarCelula(
                `${formatarNumero(item.temperatura_saida)} °C`
            )
        );

        linha.appendChild(
            criarCelula(
                `${formatarNumero(item.delta_t)} °C`
            )
        );

        linha.appendChild(
            criarCelula(
                `${formatarNumero(item.vazao_l_min)} L/min`
            )
        );

        linha.appendChild(
            criarCelula(item.criticidade)
        );

        fragmento.appendChild(linha);
    });

    tabela.appendChild(fragmento);
}