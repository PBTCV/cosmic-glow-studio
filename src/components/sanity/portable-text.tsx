import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/sanity/image";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-foreground/90 leading-relaxed mb-6 font-light">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-3xl md:text-4xl text-foreground mt-12 mb-6">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-2xl text-foreground mt-10 mb-4">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-[var(--gold)]/50 pl-6 my-8 italic text-muted-foreground font-display text-xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-foreground/90 font-light">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-foreground/90 font-light">{children}</ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const external = href.startsWith("http");
      return (
        <a
          href={href}
          className="text-[var(--gold)] underline underline-offset-4 hover:text-[var(--gold-bright)] transition-colors"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const imageUrl = value ? urlFor(value)?.width(1200).url() : null;
      if (!imageUrl) return null;
      return (
        <figure className="my-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-[var(--gold)]/20">
            <Image
              src={imageUrl}
              alt={value.alt || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.alt ? (
            <figcaption className="mt-3 text-sm text-muted-foreground font-light">
              {value.alt}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function SanityPortableText({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
