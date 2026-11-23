-- =====================================================
-- API - STATUS ATUAL
-- GET /api/status
-- =====================================================

SELECT *
FROM public.leitura_monitoramento
ORDER BY cd_leitura_monitoramento DESC
LIMIT 1;


-- =====================================================
-- API - ÚLTIMAS LEITURAS
-- GET /api/ultimas-leituras
-- =====================================================

SELECT *
FROM public.leitura_monitoramento
ORDER BY cd_leitura_monitoramento DESC
LIMIT 20;


-- =====================================================
-- API - HISTÓRICO
-- GET /api/historico
-- =====================================================

SELECT *
FROM (
    SELECT *
    FROM public.leitura_monitoramento
    ORDER BY cd_leitura_monitoramento DESC
    LIMIT 100
) AS historico

ORDER BY cd_leitura_monitoramento ASC;