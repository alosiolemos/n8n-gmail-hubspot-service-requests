const output = [];

for (const item of items) {
  const emailData = item.json;

  const fromField = emailData.From || '';

  // Expressão regular para extrair o e-mail do campo From
  const emailMatch = fromField.match(/<([^>]+)>/);
  const senderEmail = emailMatch ? emailMatch[1].trim() : fromField.trim();

  // Verifica se o domínio do e-mail é desejado
  const isMatched = senderEmail.endsWith('@cliente-a.example') || senderEmail.endsWith('@cliente-b.example');

  // Adiciona campos ao JSON original
  const enrichedJson = {
    ...emailData,
    senderEmail,
    matchedEmails: isMatched ? [senderEmail] : [],
    matched: isMatched
  };

  output.push({ json: enrichedJson });
}

return output;
