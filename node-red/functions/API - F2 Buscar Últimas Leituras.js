// API - SQL ÚLTIMAS LEITURAS

msg.query = `
SELECT *
FROM public.leitura_monitoramento
ORDER BY cd_leitura_monitoramento DESC
LIMIT 20;
`;

return msg;