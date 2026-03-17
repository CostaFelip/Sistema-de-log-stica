

## LogiSystem

Sistema web de gestão logística completo, desenvolvido com **Next.js**, **Supabase** e **Tailwind CSS**. Permite o controle integrado de estoques, compras, recebimento, financeiro e suporte em uma única plataforma.


### O que o sistema faz

O LogiSystem centraliza toda a operação logística de uma ou mais empresas, conectando os setores de compras, estoque, recebimento e financeiro em um fluxo contínuo e rastreável.

**Módulos disponíveis:**

- **Dashboard** — visão geral com indicadores em tempo real
- **Compras** — dashboard de estoque baixo, saída mensal e ordens de compra vinculadas a fornecedores
- **Ordens de Compra** — criação, aprovação e rastreamento com envio automático de email ao fornecedor
- **Recebimento** — lançamento completo de notas fiscais com dados fiscais, fornecedor, condições de pagamento e classificação contábil
- **Estoque** — controle de produtos com código SKU automático e código de barras
- **Transferências** — movimentação de produtos entre setores e empresas
- **Financeiro** — contas a pagar/receber, fluxo de caixa, orçamentos e duplicatas
- **Fornecedores** — cadastro completo com categorias de produtos fornecidos
- **Empresas e Setores** — estrutura organizacional do sistema
- **Relatórios** — histórico de movimentações por setor e empresa
- **Suporte** — abertura e acompanhamento de tickets
- **Usuários e Permissões** — controle de acesso por nível hierárquico



### Fluxo principal


Login → Dashboard → Compras → Ordem de Compra
                                     ↓ aprovada
                              Email ao fornecedor
                                     ↓ entrega
                              Recebimento (NF)
                                     ↓ confirmado
                    Estoque atualizado + Financeiro (duplicata)
                                     ↓
                              Relatórios




### Tecnologias

- **Next.js 15** — framework React
- **Supabase** — banco de dados e autenticação
- **Tailwind CSS** — estilização
- **Resend** — envio de emails automáticos
- **Vercel** — deploy


