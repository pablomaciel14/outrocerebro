# Outro Cérebro — regras do projeto

## Importação da planilha de auditoria
Sempre que o usuário anexar uma planilha "Auditoria de cadastro de Processos.xlsx" (ou equivalente):
1. Extrair todas as linhas da sheet1 e regravar `data/processos.json` (uma entrada por processo) e `data/resumo.json` (agregados).
2. Mapeamento de colunas → campos: A Data de entrada→`ent`, B Protocolo→`protocolo`, E Matéria→`mat`, F Tema→`tem`, H Unidade, I Grupo de Trabalho→`gru`, J Responsável→`res`, K Ação→`aca`, L Número do processo→`n`, M Juízo→`jui`, O OJ Descrição→`org`, R Autor→`aut`, S Réu→`reu`, T Advogado→`adv`, U Data Ajuizamento→`aju`, V Valor da causa→`val`, Y Resultado→`sta`, Z Data do resultado→`dre`, AB Físico/Eletrônico→`mei`.
3. Datas em serial Excel devem ser convertidas (ISO `YYYY-MM-DD`).
4. Valores de causa acima de R$ 50 milhões são erros de digitação da planilha: zerar, marcar `valErro` e reportar a contagem em `resumo.valoresDescartados`.
5. Andamentos/linha do tempo de cada processo derivam de: data de entrada, ajuizamento, resultado + data do resultado.
6. O painel (`Painel v3.dc.html`) lê esses JSONs em tempo de execução — não repetir números na marcação; atualizar o JSON é o que atualiza as telas.
