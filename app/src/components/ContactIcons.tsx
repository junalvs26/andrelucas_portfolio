/**
 * Icones de contato, em SVG embutido.
 *
 * Embutidos, e nao de uma biblioteca: sao tres desenhos de poucas linhas, e
 * qualquer pacote de icones traria um bundle inteiro para isso. Tambem nao sao
 * arquivos em `public/`, porque como <img> eles nao herdariam a cor do texto -
 * e o estado de hover destes cartoes muda justamente a cor.
 *
 * Todos usam `currentColor` e o mesmo traco de 1.5 num viewBox de 24, entao a
 * familia fica visualmente coerente e o hover acende os tres do mesmo jeito.
 */

export type ContactIconName = "mail" | "instagram" | "whatsapp"

interface Props {
  name: ContactIconName
  className?: string
}

/*
  `strokeLinecap`/`strokeLinejoin` arredondados: o site inteiro e tipografia
  monoespacada de traco fino, e ponta reta neste tamanho vira um pixel duro.
*/
const comuns = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export default function ContactIcon({ name, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      /* Decorativo: o rotulo textual ao lado ja nomeia o canal, e o link tem
         `aria-label` proprio. Um `title` aqui seria leitura duplicada. */
      aria-hidden="true"
      focusable="false"
    >
      {name === "mail" && (
        <g {...comuns}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </g>
      )}

      {name === "instagram" && (
        <g {...comuns}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          {/* O ponto da camera e solido: a esta escala um circulo vazado de
              0.5 de raio fecharia e viraria uma mancha de qualquer forma. */}
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </g>
      )}

      {name === "whatsapp" && (
        <g {...comuns}>
          {/* Balao com a ponta embaixo a esquerda, que e o que identifica o
              icone mesmo sem cor de marca. */}
          <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.5A8.4 8.4 0 1 1 20.5 11.6Z" />
          {/* O gancho do telefone dentro do balao. */}
          <path d="M9.2 8.6c.3-.1.6 0 .8.3l.8 1.3c.1.2.1.5 0 .7l-.5.7c-.1.2-.1.4 0 .6a6 6 0 0 0 2.5 2.5c.2.1.4.1.6 0l.7-.5c.2-.1.5-.2.7 0l1.3.8c.3.2.4.5.3.8-.2.7-.9 1.3-1.7 1.4-.6 0-1.4-.1-2.7-.8a9.6 9.6 0 0 1-3.8-3.8c-.7-1.3-.8-2.1-.8-2.7.1-.8.7-1.5 1.4-1.7Z" />
        </g>
      )}
    </svg>
  )
}
