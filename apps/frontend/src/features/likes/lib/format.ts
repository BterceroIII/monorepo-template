const compactNumberFormat = new Intl.NumberFormat("es", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatLikeCount(count: number): string {
  return compactNumberFormat.format(count);
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "IG";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
