import { inicial } from "@/lib/format";

/** Avatar del miembro: foto si existe, si no las iniciales con color de marca. */
export function Avatar({
  nombre,
  foto,
  size = 40,
}: {
  nombre: string;
  foto?: string | null;
  size?: number;
}) {
  if (foto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={foto}
        alt={nombre}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {inicial(nombre)}
    </span>
  );
}
