// API - SQL STATUS ATUAL

msg.query = `
SELECT *
FROM public.leitura_monitoramento
ORDER BY cd_leitura_monitoramento DESC
LIMIT 1;
`;

return msg;