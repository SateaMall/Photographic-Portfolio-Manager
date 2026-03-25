---
description: Writes and updates tests only, without changing production code
mode: subagent
permission:
  edit: ask
  bash:
    "*": ask
    "./mvnw test": allow
    "./mvnw -Dtest=* test": allow
    "mvn test": allow
    "mvn -Dtest=* test": allow
  webfetch: deny
color: "#27F595"
---
