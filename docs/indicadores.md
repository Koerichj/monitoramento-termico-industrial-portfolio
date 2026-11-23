# Indicadores térmicos e financeiros

Este documento descreve **o comportamento efetivo da Function F5 — Calcular indicadores**, do nó **Tarifa de energia** e dos limiares da **Function F6 — Classificar processo**, conforme o export do Node-RED revisado. O TCC fundamenta os conceitos; o código versionado determina os cálculos desta versão.

> **Aviso central:** os indicadores são derivados de **dados simulados**. Não devem ser interpretados como medições físicas certificadas, energia útil comprovadamente entregue a um tanque ou economia financeira realizada.

## 1. Variáveis utilizadas

| Campo | Unidade | Significado |
| --- | --- | --- |
| `temperatura_entrada` | °C | Temperatura da água na entrada. |
| `temperatura_saida` | °C | Temperatura da água na saída. |
| `vazao_l_min` | L/min | Vazão volumétrica estimada no instante. |
| `estado_processo` | — | `RECARREGANDO`, `AQUECENDO`, `MATURANDO` ou `TRANSFERINDO`. |
| `timestamp` | ISO 8601 | Data/hora da leitura (em UTC quando sufixada por `Z`). |
| `ciclo` | inteiro | Contagem de ciclos de operação simulados. |
| `msg.preco_kwh` | R$/kWh | Tarifa encaminhada pelo nó específico. |

O fluxo pressupõe que os campos numéricos e operacionais tenham passado pelas etapas F3 (normalização) e F4 (validação).

## 2. Constantes e parâmetros do F5

| Parâmetro | Valor no código | Observação |
| --- | --- | --- |
| Calor específico da água | `4,18 kJ/(kg·°C)` | Aproximação usada pelo modelo. |
| Conversão aproximada de volume em massa | `1 kg/L` | Suposição para água no cálculo. |
| Intervalo por amostra | `1 minuto` | Valor fixo; não calcula duração real entre timestamps. |
| Vazão mínima para contabilizar energia | `> 0,5 L/min` | Necessita ΔT positivo. |
| Volume residual desprezado | `< 0,05 L` | Ajusta `volume_instante_l` para zero. |
| ΔT de referência do desempenho | `15 °C` | Base do percentual exibido. |
| Tarifa configurada no nó anterior | `R$ 0,51/kWh` | `msg.preco_kwh = 0.51`. |
| Tarifa de fallback no F5 | `R$ 0,52/kWh` | Usada se a tarifa recebida não for positiva e finita. |

A tarifa é um **valor configurado manualmente no fluxo**, não uma consulta a distribuidora ou serviço externo. A implementação não grava uma série histórica de tarifas.

## 3. Fórmulas efetivamente implementadas

### 3.1 Diferença de temperatura

```text
delta_t = max(0, temperatura_saida - temperatura_entrada)
```

O tratamento de valores negativos para zero é uma regra de apresentação/cálculo desta versão; diferenças negativas não aparecem como energia de resfriamento.

### 3.2 Volume por amostra e acumulado diário

```text
volume_instante_l = vazao_l_min × 1 minuto
se volume_instante_l < 0,05 → volume_instante_l = 0
volume_total_l = volume_total_l_anterior + volume_instante_l
```

O acumulador é reiniciado quando a data **local do processamento no Node-RED** difere da data de contexto anterior.

### 3.3 Energia térmica por intervalo

A base física do cálculo é `Q = m × c × ΔT`.

```text
massa_kg = volume_instante_l × 1 kg/L

se vazao_l_min > 0,5 e delta_t > 0:
    energia_kj = massa_kg × 4,18 × delta_t
senão:
    energia_kj = 0

energia_kwh = energia_kj / 3600
energia_total_kwh = energia_total_kwh_anterior + energia_kwh
```

**Exemplo aritmético ilustrativo:** para uma amostra de `12 L/min`, `ΔT = 23,5 °C` e `1 minuto`:

- Volume: `12 L`;
- Massa aproximada: `12 kg`;
- Energia: `12 × 4,18 × 23,5 = 1.178,76 kJ`;
- Conversão: `1.178,76 / 3600 ≈ 0,32743 kWh`.

Esse exemplo **não valida a plausibilidade física do aquecimento solar** nem confirma o volume efetivamente transferido a um reservatório.

### 3.4 Desempenho térmico percentual

```text
desempenho_termico_percentual = limitar(delta_t / 15 × 100, 0, 100)
```

O indicador representa **ΔT relativo a uma referência escolhida**, com teto de 100%. Não equivale a eficiência termodinâmica (que exigiria, entre outras variáveis, energia solar incidente e perdas reais).

### 3.5 Economia financeira estimada

```text
economia_reais = energia_total_kwh × preco_kwh
```

O resultado é arredondado a duas casas decimais. Não inclui rendimento do equipamento de aquecimento substituído, custos auxiliares, variações tarifárias, tributos, perdas térmicas ou comprovação da energia efetivamente aproveitada.

## 4. Como o estado operacional afeta o cálculo atual

| Estado | Vazão simulada | Energia instantânea conforme F5 |
| --- | --- | --- |
| `RECARREGANDO` | Aproximadamente `9,6 L/min` | **Pode ser positiva**, se ΔT for maior que zero. |
| `AQUECENDO` | `0 L/min` | `0 kWh`. |
| `MATURANDO` | `0 L/min` | `0 kWh`. |
| `TRANSFERINDO` | Aproximadamente `12 L/min` | Pode ser positiva, se ΔT for maior que zero. |

O F5 **não condiciona o cálculo ao estado `TRANSFERINDO`**. Na recarga, a válvula de saída está fechada e ainda assim a equação pode contabilizar energia. Portanto, `energia_total_kwh` é a soma dos **valores calculados pelo modelo**, e não um acumulador exclusivo de energia útil entregue ao tanque.

O portfólio apresenta essa limitação de forma explícita, sem alterar o F5 nem criar novos campos ou indicadores.

## 5. Classificação operacional e térmica (F6)

Os critérios abaixo são os da **implementação revisada**; alguns valores não coincidem com a redação e as figuras impressas no TCC.

| Indicador | Regra atual |
| --- | --- |
| Condição térmica `Baixa` | `temperatura_saida < 35 °C` |
| `Moderada` | `35 ≤ temperatura_saida < 45 °C` |
| `Adequada` | `45 ≤ temperatura_saida ≤ 60 °C` |
| `Elevada` | `temperatura_saida > 60 °C` |
| Faixa de desempenho `Baixa` | `< 30%` |
| `Média` | `30% ≤ desempenho < 70%` |
| `Alta` | `≥ 70%` |
| Criticidade alta temperatura | `temperatura_saida > 85 °C` |
| Criticidade por falha de fluxo | `RECARREGANDO` ou `TRANSFERINDO`, com vazão `≤ 0,5 L/min` |
| Atenção por perda de calor | `TRANSFERINDO` com saída `< 40 °C` |
| Atenção por baixo ganho térmico | `AQUECENDO` ou `MATURANDO`, com `delta_t < 2 °C` |

O simulador F1 limita a temperatura a `70 °C`, enquanto F6 só dispara criticidade por alta temperatura acima de `85 °C`. Por isso a classificação de criticidade térmica **não é atingida pela simulação padrão**. Isso é uma limitação conhecida do protótipo e não deve ser confundido com uma proteção de hardware.

A F6 também verifica as posições das válvulas, a existência de vazão e a condição de transferência, emitindo estados de criticidade e mensagens de status.

## 6. Precisão, acumuladores e reinicializações

- F5 produz a energia em kJ com duas casas, a energia por amostra e acumulada em kWh com cinco casas, e o volume acumulado com duas casas. O contexto utiliza valores de ponto flutuante antes do arredondamento de saída.
- O cálculo utiliza **um minuto fixo**, mesmo que haja atraso de execução; a validade temporal depende dessa premissa.
- `volume_total_l` e `energia_total_kwh` ficam no contexto do nó F5; com armazenamento padrão somente em memória podem ser perdidos após reinicialização.
- Em 23/11/2026, o Node-RED do Raspberry Pi passou a usar `contextStorage` com `localfilesystem`; os arquivos foram gravados e o acumulador foi recuperado após reiniciar o serviço.
- O armazenamento em arquivo não é uma transação sincronizada com cada `INSERT` do PostgreSQL. Interrupções abruptas ainda podem produzir discrepâncias entre contexto e histórico; não há reconstrução automática do acumulador a partir do banco nesta versão.
- A virada diária é determinada pela **data local do sistema operacional**, não diretamente pelo sufixo UTC (`Z`) dos timestamps recebidos.

## 7. Limitações e possíveis evoluções

**Limitações da versão publicada:** dados simulados; ausência de medição física de potência solar; ausência de contabilização exclusiva de energia útil; economia financeira meramente indicativa; impossibilidade de concluir eficiência térmica real; tarifa fixa no fluxo; período histórico das APIs limitado.

**Evoluções possíveis (não implementadas):** modelar perdas/inércia térmica; distinguir energia movimentada de energia útil transferida; reconstruir acumulados pelo PostgreSQL; parametrizar tarifas pela interface; usar timestamps reais; integrar medições de CLP/sensores; validar a modelagem energética experimentalmente.

## 8. Fontes

- `node-red/flows/flows.json`: funções **Tarifa de energia**, F5 e F6 da versão consolidada.
- TCC de Jean Koerich (2026), seções 4.12, 4.13 e conclusão.
- [Arquitetura](arquitetura.md) · [Requisitos](requisitos.md) · [Validação](validacao.md)
