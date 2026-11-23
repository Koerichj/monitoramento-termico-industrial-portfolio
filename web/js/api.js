const API_BASE = "/api";

async function buscarJSON(endpoint) {
    const resposta = await fetch(`${API_BASE}${endpoint}`);

    if (!resposta.ok) {
        throw new Error(
            `Erro ao acessar ${endpoint}: HTTP ${resposta.status}`
        );
    }

    return resposta.json();
}

export async function buscarStatusAtual() {
    return buscarJSON("/status");
}

export async function buscarUltimasLeituras() {
    return buscarJSON("/ultimas-leituras");
}

export async function buscarHistorico() {
    return buscarJSON("/historico");
}
