# Validação do sistema e evidências

Este documento organiza os testes descritos no TCC de **Jean Koerich (UNIDAVI, 2026)** e os testes complementares realizados em **23/11/2026** no Raspberry Pi. Os resultados verificam **o funcionamento da camada de software com dados simulados**. Não constituem validação física de um sistema de aquecimento solar industrial.

## 1. Ambientes e escopo

| Componente | Papel no ambiente de teste |
| --- | --- |
| Raspberry Pi 5 | Servidor local, execução Linux/headless. |
| Node-RED | Geração de leituras simuladas, normalização, validação, indicadores, classificação e API. |
| PostgreSQL | Armazenamento na tabela `public.leitura_monitoramento`. |
| Nginx | Hospedagem do dashboard e proxy reverso `/api/` na implantação do TCC. |
| HTML/CSS/JavaScript | Interface web com indicadores, últimas leituras e gráfico de temperaturas. |

A fonte de dados efetiva é o **simulador do F1**. O adaptador para CLP foi implementado em F2, mas **não há evidência de aquisição Siemens S7 operacional nem de sensores físicos integrados**.

## 2. Resultados documentados no TCC

| Teste | Evidência registrada no trabalho | Resultado relatado |
| --- | --- | --- |
| Geração periódica de leituras | Execução com intervalo nominal de aproximadamente um minuto. | Dados gerados ao longo do período de testes. |
| Armazenamento histórico | **61.238 leituras** de **05/09/2026 a 21/10/2026** na tabela `leitura_monitoramento`. | Histórico persistido e disponível para consulta. |
| Integração entre componentes | Node-RED, PostgreSQL, API REST, Nginx e dashboard. | Fluxo integrado descrito como funcional. |
| Consultas API | Status atual, últimas leituras e histórico. | Endpoints retornaram as informações esperadas. |
| Reinicialização do equipamento | Reinício completo do Raspberry Pi. | Node-RED, PostgreSQL e Nginx iniciaram automaticamente e retomaram a operação. |
| Mudança de rede | Raspberry Pi e computador conectados a um ponto de acesso de celular. | Frontend continuou acessando `/api/` sem alterar URLs absolutas. |

**Fonte:** TCC, seções 4.19 (páginas 68–69 do PDF) e 5 (páginas 70–72). O número **61.238** corresponde ao período acadêmico, e não a uma contagem atualizada até novembro.

## 3. Verificações complementares de 23/11/2026

As verificações abaixo ocorreram no ambiente local do Raspberry Pi após a consolidação do código em `a1703be` e da correção da consulta da API F1.

| Caso | Evidência disponível | Resultado |
| --- | --- | --- |
| `GET /api/status` | Resposta JSON com `sucesso: true` e leitura mais recente. | **Aprovado:** dados consultados do PostgreSQL. |
| `GET /api/ultimas-leituras` | Resposta com `sucesso: true` e `total: 20`. | **Aprovado:** 20 registros retornados. |
| `GET /api/historico` | Resposta com `sucesso: true` e `total: 100`. | **Aprovado:** 100 registros retornados. |
| Geração após atualização | Identificadores de leituras avançaram durante o acompanhamento. | **Aprovado:** persistência de novas amostras. |
| Armazenamento de contexto | Node-RED registrou `Context store : 'default' [module=localfilesystem]`; arquivos locais de F1/F5 foram criados. | **Aprovado:** contexto gravado no runtime. |
| Recuperação após restart do Node-RED | Serviço reiniciado às **10:43:58 UTC−3**; nova leitura `136555` às **10:44:59 UTC−3**. | **Aprovado no caso testado:** acumulado permaneceu em `0,02107 kWh`, volume em `48 L` e ciclo em `1`. |
| Fuso horário do sistema | Ajustado de `America/Chicago` para `America/Sao_Paulo`. | **Corrigido:** horário local UTC−3 com NTP ativo. |

A leitura anterior ao reinício foi a `136554`, às 10:43:36 UTC−3. A consulta imediatamente após o restart ainda retornava essa **leitura histórica**, por isso a recuperação só foi considerada demonstrada quando a leitura **nova `136555`** foi registrada.

**Limite da evidência:** esse ensaio confirma a recuperação do acumulador na reinicialização controlada observada; não comprova tolerância a desligamento abrupto, perda de energia elétrica ou atualização transacional entre o contexto em arquivo e o PostgreSQL.

## 4. Uma anomalia identificada e tratada parcialmente

Durante um Deploy do Node-RED, em **23/11/2026 às 10:04:50 UTC−3**, a energia acumulada exibida caiu de `0,02207 kWh` para `0,01170 kWh`. O segundo valor coincide aproximadamente com a energia calculada apenas para a amostra de recarga daquele instante, o que é compatível com **reinicialização do contexto em memória**.

A revisão do `settings.js` mostrou que `contextStorage` estava inicialmente comentado. Após habilitar `localfilesystem` e reiniciar, foram observados arquivos de contexto para F1 e F5. Um segundo restart controlado conservou o acumulador.

Esta correção é **configuração do ambiente**, não um recurso que se torna automaticamente ativo ao importar o `flows.json` em outra máquina.

A versão atual ainda mantém limitações relevantes:

- O cálculo de energia utiliza intervalo fixo de um minuto.
- Energia pode ser contabilizada durante `RECARREGANDO`, embora não haja saída aberta para o tanque.
- `economia_reais` é uma estimativa aritmética vinculada a essa energia, sem validação experimental de economia efetiva.
- O percentual de desempenho é relativo ao ΔT de referência, não à eficiência termodinâmica medida.
- Não existe recuperação automática dos acumuladores usando a soma do histórico PostgreSQL após perdas de contexto.

## 5. Testes em memória relatados na auditoria do código

A auditoria técnica anterior informou verificações de:

- Coerência das transições de estado de F1, posições das válvulas e contagem de ciclos.
- Correspondência entre os **16 nós Function** do export e as cópias JavaScript de referência.
- Composição dos subfluxos e parâmetros do `INSERT` com 29 posições.
- Classificação e formatação das três consultas REST com registros sintéticos.

Essas verificações são **testes estáticos ou em memória**; devem ser distinguidas dos testes de execução real realizados no Raspberry Pi. Não há, neste pacote, uma suíte automatizada integrada anexada que permita reproduzir esses relatórios independentemente.

## 6. O que ainda não foi comprovado

| Item | Situação |
| --- | --- |
| Aquisição real de sensores e CLP Siemens | Não implementada/validada nesta versão. |
| Calibração de sensores e precisão das temperaturas/vazões | Não aplicável ao simulador; falta validação experimental. |
| Eficiência real do aproveitamento solar e economia obtida | Não comprovada pelos indicadores simulados. |
| Falhas abruptas de alimentação e recuperação integral do histórico | Não demonstradas por ensaio específico. |
| Métricas quantitativas de CPU, RAM, latência, throughput e disponibilidade | Não documentadas como benchmark. |
| Autenticação nas três rotas GET | Não implementada no fluxo analisado. |
| Acesso público seguro à interface ou ao editor | Não faz parte do escopo validado. |
| Testes automatizados de implantação a partir de clone limpo | Ainda requer guia reproduzível e execução independente. |

## 7. Roteiro de reprodução dos testes de consulta

Em uma instalação **local e autorizada**, com Nginx encaminhando `/api/` para o Node-RED:

```bash
curl -fsS http://127.0.0.1/api/status | python3 -m json.tool
curl -fsS http://127.0.0.1/api/ultimas-leituras | python3 -m json.tool
curl -fsS http://127.0.0.1/api/historico | python3 -m json.tool
```

Para verificar a atualização contínua sem modificar o banco:

```bash
curl -fsS http://127.0.0.1/api/status | python3 -c '
import sys,json
r=json.load(sys.stdin)
d=r.get("dados",{})
print("id:",d.get("id"),"timestamp:",d.get("timestamp"),"estado:",d.get("estado_processo"))
'
```

Execute novamente após o período nominal do Inject e compare o identificador e timestamp. O resultado dependerá do serviço, do fluxo e do banco em execução.

Para conferir a configuração **sem revelar valores de contexto, credenciais ou dados do banco**:

```bash
systemctl is-active nodered
# O log deve registrar: Context store : 'default' [module=localfilesystem]
systemctl status nodered --no-pager
find ~/.node-red/context -maxdepth 3 -type f -printf '%p (%s bytes)\n'
```

**Não é necessário reiniciar o Node-RED apenas para ler essa documentação.** Testes de reinicialização devem ser realizados somente em um ambiente controlado, com backup e registro dos valores anteriores.

## 8. Interpretação dos resultados

Os testes são suficientes para demonstrar a **integração da camada de software e persistência de dados de simulação** nas condições documentadas. Não permitem concluir que o modelo térmico reproduza quantitativamente uma planta real nem que o sistema seja adequado para exposição pública da API ou operação crítica sem adaptações.

**Fontes:** TCC de Jean Koerich, UNIDAVI, 2026 (seções 4.19 e 5); logs, consultas HTTP e resultados compartilhados na validação de 23/11/2026; export revisado do Node-RED.
**Relacionados:** [Arquitetura](arquitetura.md) · [API REST](api.md) · [Indicadores](indicadores.md)