import Image from "next/image";
import logo from "./logo.png";

export function Logo() {
  return (
    <span className="brand-logo">
      <Image className="brand-logo__image" src={logo} alt="Adreach — Reach More Convert Better" priority />
    </span>
  );
}
