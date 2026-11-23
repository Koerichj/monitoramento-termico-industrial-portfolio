export function obterDadosDemonstracao(estado) {
    const base = {
        ciclo: 12,
        volume_total_l: 150.0,
        energia_total_kwh: 4.5,
        economia_reais: 18.0
    };

    switch (estado) {
        case "RECARREGANDO":
            return {
                ...base,
                origem: "demonstracao",
                estado_processo: "RECARREGANDO",
                status_operacional: "Recarregando",
                temperatura_entrada: 20.0,
                temperatura_saida: 21.0,
                delta_t: 1.0,
                vazao_l_min: 9.6,
                valvula_entrada: "Aberta",
                valvula_saida: "Fechada",
                nivel_tubulacao_percentual: 45,
                tempo_maturacao_min: 0,
                fator_solar: 0.75,
                desempenho_termico_percentual: 6.67,
                criticidade: "Normal",
                status_validacao: "OK",
                observacao: "Demonstração do estado de recarga da tubulação."
            };
        case "AQUECENDO":
            return {
                ...base,
                origem: "demonstracao",
                estado_processo: "AQUECENDO",
                status_operacional: "Aquecendo",
                temperatura_entrada: 20.0,
                temperatura_saida: 29.0,
                delta_t: 9.0,
                vazao_l_min: 0,
                valvula_entrada: "Fechada",
                valvula_saida: "Fechada",
                nivel_tubulacao_percentual: 100,
                tempo_maturacao_min: 0,
                fator_solar: 0.90,
                desempenho_termico_percentual: 60,
                criticidade: "Normal",
                status_validacao: "OK",
                observacao: "Demonstração da etapa de aquecimento."
            };
        case "MATURANDO":
            return {
                ...base,
                origem: "demonstracao",
                estado_processo: "MATURANDO",
                status_operacional: "Maturando",
                temperatura_entrada: 20.0,
                temperatura_saida: 36.0,
                delta_t: 16.0,
                vazao_l_min: 0,
                valvula_entrada: "Fechada",
                valvula_saida: "Fechada",
                nivel_tubulacao_percentual: 100,
                tempo_maturacao_min: 4,
                fator_solar: 0.92,
                desempenho_termico_percentual: 100,
                criticidade: "Normal",
                status_validacao: "OK",
                observacao: "Demonstração da etapa de estabilização térmica."
            };
        case "TRANSFERINDO":
            return {
                ...base,
                origem: "demonstracao",
                estado_processo: "TRANSFERINDO",
                status_operacional: "Transferindo",
                temperatura_entrada: 20.0,
                temperatura_saida: 36.0,
                delta_t: 16.0,
                vazao_l_min: 10.5,
                valvula_entrada: "Aberta",
                valvula_saida: "Aberta",
                nivel_tubulacao_percentual: 75,
                tempo_maturacao_min: 0,
                fator_solar: 0.85,
                desempenho_termico_percentual: 100,
                criticidade: "Normal",
                status_validacao: "OK",
                observacao: "Demonstração da transferência da água pré-aquecida."
            };
        default:
            return null;
    }
}
