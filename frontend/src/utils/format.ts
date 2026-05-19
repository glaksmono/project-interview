export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Rp -";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getErrorMessage(err: unknown): string {
  const e = err as {
    response?: { data?: { message?: unknown; error?: unknown } };
    message?: unknown;
  };

  const message =
    typeof e?.response?.data?.message === "string"
      ? e.response.data.message
      : typeof e?.response?.data?.error === "string"
        ? e.response.data.error
        : typeof e?.message === "string"
          ? e.message
          : null;

  return message || "An error occurred";
}
