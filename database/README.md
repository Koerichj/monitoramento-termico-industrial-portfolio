# Banco de dados PostgreSQL

O fluxo do Node-RED grava e consulta `public.leitura_monitoramento`. Prepare um banco de teste novo e escolha uma das duas opções de esquema abaixo.

## Preparação

Execute os comandos a partir da raiz do repositório. Use um servidor PostgreSQL em execução, o cliente `psql` e uma conta com permissão para criar o banco. Nos exemplos, ajuste o host, a porta e o usuário à sua instalação. A conta que aplicar o esquema precisa poder criar objetos em `public`.

```sh
psql -X -h localhost -p 5432 -U postgres -d postgres -v ON_ERROR_STOP=1 -f database/scripts/01_criar_banco.sql
```

O script `01` cria `monitoramento_termico` em UTF-8 a partir de `template0`. Execute-o fora de uma transação e apenas se o banco ainda não existir. Se você já tiver um banco de teste vazio provisionado, use o nome dele nos comandos seguintes.

## Escolha do esquema

**Esquema mínimo para executar o protótipo.** O script `02` cria a tabela de leituras, sua sequência e sua chave primária.

```sh
psql -X -h localhost -p 5432 -U postgres -d monitoramento_termico -v ON_ERROR_STOP=1 -1 -f database/scripts/02_criar_tabela_leitura_monitoramento.sql
```

**Esquema completo para explorar a modelagem relacional.** Em um banco vazio, o script `00` cria a mesma estrutura de leituras e as tabelas adicionais `dispositivo`, `status_operacional`, `sensor`, `leitura_processo` e `alerta`, com suas chaves estrangeiras.

O arquivo está em UTF-16 LE. O PowerShell lê essa codificação e envia o conteúdo SQL, que usa apenas caracteres ASCII, à entrada padrão do `psql`.

```powershell
Get-Content -Raw -Encoding Unicode database/scripts/00_schema_completo.sql |
    psql -X -h localhost -p 5432 -U postgres -d monitoramento_termico -v ON_ERROR_STOP=1 -1 -f -
```

Execute apenas um dos comandos de esquema por banco. Os scripts `00` e `02` criam os mesmos objetos de leitura e falham se eles já existirem. A opção `-1`, combinada com `ON_ERROR_STOP`, aplica o esquema em uma única transação e reverte a execução em caso de erro.

O script `03_criar_estrutura_relacional.sql` fica como referência. Ele repete os objetos relacionais do `00`, usa tipos de data e hora diferentes em algumas colunas e tenta adicionar a última chave estrangeira em `public.alertas`, embora crie `public.alerta`. Para criar a estrutura relacional, use a opção completa acima.

## Consultas de verificação

Os scripts `04` e `05` só fazem consultas e dependem de `public.leitura_monitoramento`. Depois de aplicar o esquema escolhido, execute:

```sh
psql -X -h localhost -p 5432 -U postgres -d monitoramento_termico -v ON_ERROR_STOP=1 -f database/scripts/04_consultas_api.sql
psql -X -h localhost -p 5432 -U postgres -d monitoramento_termico -v ON_ERROR_STOP=1 -f database/scripts/05_consultas_teste.sql
```

O script `04` reúne as consultas correspondentes às três rotas da API. O `05` inclui contagem, período armazenado e resumos das leituras. Em um banco recém-criado, a contagem esperada é zero. Depois de configurar as conexões PostgreSQL no Node-RED e acionar a origem simulada, repita as consultas para confirmar a gravação de novas leituras. A conta usada pelo fluxo precisa de acesso ao banco e ao esquema, permissão de leitura e inserção na tabela e permissão para usar a sequência.

Veja a [reprodução do protótipo](../README.md#reproduzir-o-protótipo) e os [contratos da API](../docs/api.md).
