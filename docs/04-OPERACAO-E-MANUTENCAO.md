# Operação, Manutenção e Publicação

[← Dados e segurança](03-DADOS-E-SEGURANCA.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md) · [Ver changelog](CHANGELOG.md)

## Rotina Local de Desenvolvimento

```bash
# Iniciar servidor local
npm run dev

# Validar compilação do Next.js
npm run build

# Executar suíte de testes comportamentais
npm test

# Executar linter
npm run lint
```

---

## Migração de Dados da Planilha

Para importar o acervo completo da planilha Excel para o Supabase:

1. Configure as variáveis em `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```
2. Execute o script de carga em lote:
   ```bash
   python migrar_dados.py
   ```

---

## Fluxo de Publicação e Deploy

1. **GitHub**: Repositório principal do código-fonte em <https://github.com/pablomaciel14/outrocerebro>.
2. **Deploy Automático**: Cada `git push` na branch `main` dispara o build e deploy em produção.
3. **Validações Pré-Deploy**: Sempre certifique-se de que `npm run build` e `npm test` foram executados com sucesso antes do envio.
