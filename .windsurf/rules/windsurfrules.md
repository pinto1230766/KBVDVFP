---
trigger: always_on
---

# .windsurfrules
standards:
  - "Indentation 2 espaces"
  - "Single quotes pour les strings"
  - "Pas de trailing commas"
architecture:
  - "Dossier src/ pour le code principal"
  - "Dossier tests/ pour les tests unitaires"
ai:
  mode: "chat"          # chat ou write
  maxTokens: 2048
  enableAgent: true
