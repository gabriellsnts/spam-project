# SPAM System (Sistema Preditivo de Análise Multi-Domínio)

A predictive analytics platform handling 4 domains:
- Equipment maintenance
- Demand forecasting
- Customer churn
- Credit risk

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- shadcn/ui
- TypeScript

## Folder Structure

```text
/app
  /(auth)/login          - Authentication pages
  /dashboard             - Main dashboard view
  /(domains)/maintenance - Equipment maintenance module
  /(domains)/demand      - Demand forecasting module
  /(domains)/churn       - Customer churn module
  /(domains)/credit-risk - Credit risk module
/components
  /ui                    - Base shadcn components
  /shared                - Shared components (Sidebar, Header, Layout)
  /auth                  - Authentication specific components
  /modules               - Domain-specific components
/lib
  /hooks                 - Custom React hooks
  /utils                 - Utility functions
/types                   - TypeScript type definitions
```
