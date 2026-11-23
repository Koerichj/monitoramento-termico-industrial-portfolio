// API - SQL HISTÓRICO

msg.query = `
SELECT *
FROM (
    SELECT *
    FROM public.leitura_monitoramento
    ORDER BY cd_leitura_monitoramento DESC
    LIMIT 100
) AS ultimas_leituras
ORDER BY cd_leitura_monitoramento ASC;
`;

return msg;