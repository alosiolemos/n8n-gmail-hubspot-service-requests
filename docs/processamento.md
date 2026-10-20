# Seleção e processamento

O Gmail1 consulta mensagens não lidas. O código extrai o endereço do campo From, tanto de Nome <email> quanto de um endereço direto. Em seguida verifica o final do endereço contra dois domínios permitidos.

Na versão pública, os domínios foram substituídos por cliente-a.example e cliente-b.example. O código preserva o JSON da mensagem e acrescenta senderEmail, matchedEmails e matched.

Checagem 01 combina a aprovação do remetente com uma condição sobre o assunto para evitar respostas e encaminhamentos que contenham variações como RE:, RES:, ENC: e Fwd:. É uma lista explícita de padrões, não uma classificação universal de todas as respostas de e-mail.

O caminho de criação lê a mensagem, faz POST para o objeto de solicitações no HubSpot e só depois encaminha à marcação como lida. É uma sequência útil para o controle, mas não uma transação: se o card for criado e a marcação falhar, uma nova leitura pode repetir a solicitação. Não há chave de idempotência explicitamente demonstrada.

A comparação de domínio usa endsWith sem normalizar caixa. Validar endereço de remetente por texto não comprova autenticidade, SPF/DKIM ou confiança do conteúdo. Mensagens fora do filtro podem continuar não lidas e voltar a ser consultadas.

Os testes locais cobrem a extração e o resultado do código. Não executam a condição IF pelo motor n8n nem a criação do card.
