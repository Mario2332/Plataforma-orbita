#!/bin/bash

echo "🧪 Testando envio de email..."
echo ""

# Fazer requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  https://southamerica-east1-plataforma-mentoria-mario.cloudfunctions.net/testEmail \
  -H "Content-Type: application/json" \
  -d '{"to":"mentoriaenemmario@gmail.com","subject":"Teste de Email","html":"<h1>Teste</h1><p>Email funcionando</p>"}')

# Separar body e status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "Status HTTP: $HTTP_CODE"
echo "Resposta: $HTTP_BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Email adicionado à fila com sucesso!"
  echo "📧 Verifique sua caixa de entrada (mentoriaenemmario@gmail.com)"
  echo "⏰ Aguarde alguns segundos..."
  echo "📂 Se não aparecer, verifique Spam/Lixo Eletrônico"
else
  echo "❌ Erro ao enviar email"
  echo "Verifique os logs no Firebase Console"
fi
