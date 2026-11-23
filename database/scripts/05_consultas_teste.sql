-- =====================================================
-- ÚLTIMOS 10 REGISTROS
-- =====================================================

SELECT *
FROM public.leitura_monitoramento
ORDER BY cd_leitura_monitoramento DESC
LIMIT 10;


-- =====================================================
-- QUANTIDADE TOTAL DE REGISTROS
-- =====================================================

SELECT
    COUNT(*) AS total_registros

FROM public.leitura_monitoramento;


-- =====================================================
-- PERÍODO ARMAZENADO
-- =====================================================

SELECT
    MIN(dt_registro) AS primeira_leitura,
    MAX(dt_registro) AS ultima_leitura

FROM public.leitura_monitoramento;


-- =====================================================
-- REGISTROS POR ESTADO
-- =====================================================

SELECT
    ds_estado_processo,
    COUNT(*) AS quantidade

FROM public.leitura_monitoramento

GROUP BY ds_estado_processo

ORDER BY quantidade DESC;


-- =====================================================
-- REGISTROS POR ORIGEM
-- =====================================================

SELECT
    ds_origem,
    COUNT(*) AS quantidade

FROM public.leitura_monitoramento

GROUP BY ds_origem;


-- =====================================================
-- STATUS DE VALIDAÇÃO
-- =====================================================

SELECT
    ds_status_validacao,
    COUNT(*) AS quantidade

FROM public.leitura_monitoramento

GROUP BY ds_status_validacao;


-- =====================================================
-- ALERTAS DE VALIDAÇÃO
-- =====================================================

SELECT *
FROM public.leitura_monitoramento

WHERE ds_status_validacao <> 'OK'

ORDER BY dt_registro DESC;


-- =====================================================
-- REGISTROS COM CRITICIDADE
-- =====================================================

SELECT *
FROM public.leitura_monitoramento

WHERE ds_criticidade IS NOT NULL
AND ds_criticidade <> 'Normal'

ORDER BY dt_registro DESC;


-- =====================================================
-- MÉDIAS DE TEMPERATURA
-- =====================================================

SELECT
    AVG(nr_temperatura_entrada) AS media_temperatura_entrada,
    AVG(nr_temperatura_saida) AS media_temperatura_saida,
    AVG(nr_delta_t) AS media_delta_t

FROM public.leitura_monitoramento;


-- =====================================================
-- ENERGIA ACUMULADA MAIS RECENTE
-- =====================================================

SELECT
    nr_energia_total_kwh

FROM public.leitura_monitoramento

ORDER BY cd_leitura_monitoramento DESC

LIMIT 1;