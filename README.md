refatoração de useTasks.ts

1. codigo duplicado (createTask e updateTask)
Problema: as duas funções tinham o mesmo bloco de setSubmitting, setError, try/catch/finally
O que fiz: criei uma função withSubmit que centraliza esse ciclo
Por que é melhor: qualquer mudança no tratamento de erro agora é feita em um lugar só

2. validação duplicada
Problema: o if (!taskData.title.trim()) aparecia igual nas duas funções
O que fiz: extraí em uma função validateTitle
Por que é melhor: menos repetição, mais fácil de mudar a regra de validação depois

3. fetch direto no hook
Problema: o hook tinha fetch, method, headers, body espalhado nele, misturando HTTP com estado
O que fiz: usei as funções do taskApi.ts que já existiam
Por que é melhor: o hook cuida só de estado, a camada de API cuida do HTTP

4. useCallback
Problema: as funções eram recriadas a cada render sem necessidade
O que fiz: envolvi todas com useCallback
Por que é melhor: componentes filhos que recebem essas funções como props não re-renderizam à toa

5. atualizaçao otimista
Problema: após criar, atualizar, deletar ou toggle, o hook chamava fetchTasks()
O que fiz: atualizei o estado local direto com o dado que a API já retornou
Por que é melhor: a UI responde mais rápido e faz menos requisições