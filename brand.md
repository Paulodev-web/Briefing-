# devpaulo.com.br — Brand Context (AI-readable)

> Use este arquivo como contexto ao criar qualquer interface, copy ou componente da devpaulo.
> Todos os valores são production-ready: hex, peso de fonte, proporções, regras de voz.

---

## 1. IDENTIDADE DA MARCA

```
Nome:        devpaulo / devpaulo.com.br
Modelo:      Estúdio de diagnóstico e desenvolvimento de software sob medida
Público:     Exclusivamente médias empresas
Fundador:    Paulo Ricardo (opera sozinho — comercial + operacional)
Diferencial: Diagnostica o problema real ANTES de qualquer código
Tagline:     "Resolvo o gargalo da sua operação — com sistema sob medida ou automação com IA."
Posição:     Parceiro estratégico, não fornecedor técnico. Senta do lado do cliente.
```

**Pilares da marca:**
- Sóbrio e direto — confiança vem da clareza, não de efeitos visuais
- Sem buzzwords — fala a língua de quem decide (dono/gestor), não jargão de dev
- Orientado a resultado — o problema real, não a tecnologia

---

## 2. CORES

### Paleta completa

| Token            | Hex       | Uso                                          |
|------------------|-----------|----------------------------------------------|
| `brand-green`    | `#01603B` | Cor principal. CTAs, links, acentos.         |
| `brand-green-dk` | `#014A2D` | Hover e estados pressionados (verde escuro). |
| `brand-green-lt` | `#D7EBE0` | Fundos suaves, tags, badges, destaques.      |
| `graphite`       | `#141414` | Hero, seções de conversão, footer.           |
| `off-white`      | `#F8FAFC` | Fundo padrão do site (domina o layout).      |
| `ink`            | `#0F172A` | Texto principal.                             |
| `muted`          | `#64748B` | Texto secundário, subtítulos.                |
| `border`         | `#E2E8F0` | Bordas e divisores.                          |

### Proporção de uso: 70 / 22 / 8

```
70% → off-white (#F8FAFC)   — base. Transmite calma e clareza.
22% → graphite (#141414)    — hero, conversão, footer. Cria ritmo e contraste.
 8% → brand-green (#01603B) — APENAS como acento: CTAs, links, destaques.
```

**Regras críticas de cor:**
- Verde (`#01603B`) NUNCA como fundo de seção inteira
- Logo verde somente sobre fundos claros; logo branco sobre fundos escuros/grafite
- Proibido: verde neon, gradientes coloridos, fundo preto puro (#000), efeitos 3D/glow/metálico

---

## 3. LOGO

### Versões

| Versão    | Quando usar                        | Arquivo                        |
|-----------|------------------------------------|--------------------------------|
| Principal | Fundos claros (off-white, branco)  | `public/logo/devpaulo.png`     |
| Branca    | Fundos escuros (grafite, verde dk) | `public/logo/logo-white.png`   |

### Regras de uso

- **Área de proteção:** espaço livre ao redor = altura da letra "d" do logo
- **Tamanho mínimo:** 24 px (digital) — abaixo disso o "P" perde legibilidade
- **Nunca:** distorcer proporções, girar, inclinar, trocar cor, adicionar sombra/brilho/3D, recriar com outra fonte

---

## 4. TIPOGRAFIA

**Família única:** `Inter` (Google Fonts / system-ui fallback)

| Peso          | CSS value         | Uso                                   |
|---------------|-------------------|---------------------------------------|
| Black (900)   | `font-weight: 900`| Títulos e headlines (h1, h2)          |
| Semibold (600)| `font-weight: 600`| Botões, destaques, labels, h3         |
| Regular (400) | `font-weight: 400`| Corpo de texto e parágrafos           |
| Light (300)   | `font-weight: 300`| Subtítulos e textos de apoio          |

**Escalas recomendadas (Tailwind):**

```
h1 → text-5xl font-black     (headlines hero)
h2 → text-3xl font-black     (títulos de seção)
h3 → text-xl  font-semibold  (subtítulos)
p  → text-base font-normal   (corpo)
small / muted → text-sm font-light text-[#64748B]
button → text-sm font-semibold
```

---

## 5. TOM DE VOZ

### Princípios

| Atributo           | Faça                                            | Evite                                         |
|--------------------|-------------------------------------------------|-----------------------------------------------|
| **Direto**         | "Você ainda controla pedidos pelo WhatsApp?"    | "Otimizamos seus processos operacionais."     |
| **Acessível**      | "Um sistema que faz isso sozinho."              | "Solução de automação com stack moderna."     |
| **Confiante**      | "Já resolvi esse problema antes."               | "Somos líderes em inovação digital."          |
| **Orientado a resultado** | "Sua equipe deixa de digitar o mesmo dado duas vezes." | "Implementamos integração de sistemas." |

### Palavras proibidas (buzzwords a evitar)

```
inovação · transformação digital · soluções digitais · ecossistema
sinergia · powered by AI · escalável · full stack
```

### Ícones/visuais a evitar

```
< > (angle brackets como decoração) · engrenagens · circuitos eletrônicos
gradientes berrantes · efeito 3D/glow/metálico · verde neon/fluorescente
```

---

## 6. STACK TÉCNICA (para contexto ao gerar código)

```
Frontend:  React, Next.js 14+, Tailwind CSS, Framer Motion
Backend:   Supabase (PostgreSQL), APIs REST
Automação: n8n, Redis
Deploy:    Vercel
```

---

## 7. CHECKLIST DE APLICAÇÃO

Antes de entregar qualquer interface ou copy gerado com esta marca, verifique:

- [ ] Fundo dominante é off-white (`#F8FAFC`)?
- [ ] Verde usado só em CTAs, links ou badges pequenos?
- [ ] Hero/footer em grafite (`#141414`) com texto e logo brancos?
- [ ] Fonte Inter com os pesos corretos (900 para títulos, 400 para corpo)?
- [ ] Copy sem buzzwords — fala resultado, não tecnologia?
- [ ] Logo na versão correta para o fundo (verde ou branco)?
- [ ] Sem sombras, gradientes ou efeitos decorativos no logo?

---

## 8. EXEMPLO DE TOKENS TAILWIND

```js
// tailwind.config.js — extend.colors
colors: {
  brand: {
    green:    '#01603B',
    greenDk:  '#014A2D',
    greenLt:  '#D7EBE0',
    graphite: '#141414',
    offwhite: '#F8FAFC',
    ink:      '#0F172A',
    muted:    '#64748B',
    border:   '#E2E8F0',
  }
}
```

```js
// tailwind.config.js — extend.fontFamily
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

---

## 9. CONTATO / IDENTIDADE PÚBLICA

```
Email:   contato@devpaulo.com.br
Site:    devpaulo.com.br
```

---

*Versão: 1.0 · Junho 2026 · Gerado a partir do Manual de Marca oficial (manual-marca-devpaulo.pptx)*
