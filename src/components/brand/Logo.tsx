import { existsSync } from "node:fs";
import { join } from "node:path";

export function Logo({ dark = false }: { dark?: boolean }) {
  const source = dark ? "/brand/adreach-logo-dark.png" : "/brand/adreach-logo-light.png";
  const hasAsset = existsSync(join(process.cwd(), "public", source));
  return (
    <span className="brand-logo">
      {/* A supplied local brand asset is used as-is; the text mark prevents broken images before delivery. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {hasAsset ? <img className="brand-logo__image" src={source} alt="Adreach" width="180" height="52" /> : <span className="brand-logo__fallback" aria-label="Adreach"><b>AD</b>REACH</span>}
    </span>
  );
}
