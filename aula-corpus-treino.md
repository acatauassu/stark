# Quanto tempo levaria para "ler" todo o corpus de treino de um LLM?

> Exercício para aula — estimativa de ordem de grandeza.
> Hipótese: leitura a **200 palavras por minuto**, **12 horas por dia**, todos os dias.

---

## Aviso metodológico

A Anthropic **não divulga publicamente** o tamanho exato do corpus de treino do Claude. Os números abaixo são **estimativas** baseadas em ordens de grandeza típicas de modelos de fronteira, que costumam ser treinados em algo entre **10 e 30 trilhões de tokens**.

---

## A conta

### Velocidade de leitura

- 200 palavras/min × 60 min × 12 h = **144.000 palavras/dia**
- × 365 dias ≈ **52,6 milhões de palavras/ano**

### Volume de treino (estimativa)

- 1 token ≈ 0,75 palavra (em inglês)
- Valor central adotado: **~15 trilhões de tokens** ≈ **11,25 trilhões de palavras**

### Tempo

$$\frac{11{,}25 \times 10^{12}}{52{,}6 \times 10^{6}} \approx 214.000 \text{ anos}$$

---

## Faixa de cenários

| Corpus de treino     | Palavras  | Anos lendo 12h/dia a 200 ppm |
| -------------------- | --------- | ---------------------------- |
| 10 trilhões de tokens | 7,5 T     | **~143.000 anos**            |
| 15 trilhões de tokens | 11,25 T   | **~214.000 anos**            |
| 30 trilhões de tokens | 22,5 T    | **~428.000 anos**            |

---

## Comparações para impressionar a turma

- O *Homo sapiens* tem **~300.000 anos** de existência. No cenário central, você levaria **mais tempo lendo** do que toda a história da humanidade.
- A Biblioteca do Congresso dos EUA tem **~51 bilhões de palavras** em texto. Você leria essa biblioteca inteira em **~970 dias** — e precisaria repetir o feito **~220 vezes** para cobrir o corpus.
- Uma vida humana adulta lendo 12h/dia (dos 18 aos 88 anos = 70 anos) cobriria **~3,7 bilhões de palavras**, ou seja, cerca de **0,03%** do total.

---

## Frase de palco

> "Para ler tudo que me treinou, você precisaria de mais ou menos **200 mil anos** lendo 12 horas por dia, todos os dias, sem parar."

---

## Premissas usadas (resumo)

- Velocidade: 200 palavras/min
- Jornada: 12 horas/dia, 365 dias/ano
- Conversão: 1 token ≈ 0,75 palavra (inglês)
- Corpus assumido: 10–30 trilhões de tokens (faixa pública para LLMs de fronteira; valor exato do Claude não é divulgado)
