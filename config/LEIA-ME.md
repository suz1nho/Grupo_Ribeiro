# Script do Banco de Dados

## Como Usar

1. Abra o phpMyAdmin: `http://localhost/phpmyadmin`
2. Clique em **SQL** no menu superior
3. Copie o conteúdo do arquivo `schema.sql`
4. Cole e clique em **Executar**

## O que Este Script Faz

✅ Cria o banco de dados `grupo_ribeiro`
✅ Cria 4 tabelas essenciais:
   - `employees` - Usuários do sistema
   - `appointments` - Agendamentos dos clientes
   - `credit_analysis` - Análises de crédito
   - `contacts` - Mensagens de contato

✅ Insere um usuário admin padrão:
   - Email: admin@gruporibeiro.com
   - Senha: admin123

## Estrutura da Tabela Appointments

```sql
appointments:
- id (chave primária)
- name (nome do cliente)
- email
- phone (telefone)
- cpf (opcional)
- appointment_date (data do agendamento)
- appointment_day (dia da semana)
- appointment_time (horário)
- message (mensagem adicional)
- status (pending, confirmed, cancelled)
- confirmed_by (ID do funcionário que confirmou)
- confirmed_at (data/hora da confirmação)
- created_at
- updated_at
```

## Importante

Execute este script ANTES de usar o sistema de agendamentos!
