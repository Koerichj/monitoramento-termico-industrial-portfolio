export function formatarNumero(valor, casas = 2) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "--";
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "--";
    }
    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

export function formatarData(data) {
    if (!data) return "--";
    return new Date(data).toLocaleString("pt-BR");
}

export function formatarHorario(data) {
    if (!data) return "--";
    const d = new Date(data);
    return d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function limitar(valor, min, max) {
    return Math.max(min, Math.min(max, valor));
}
