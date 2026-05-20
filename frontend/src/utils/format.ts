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

  // Handle API validation error shape:
  // {
  //   error: "VALIDATION_ERROR",
  //   message: "Invalid request body.",
  //   details: { fields: [ { path: 'password', message: '...' }, ... ] }
  // }
  const data = e?.response?.data as unknown;

  if (data && typeof data === "object") {
    // If API provided field-level validation details, join them
    type FieldDetail = { path?: string; message?: string };
    type ApiErrorShape = { message?: string; error?: string; details?: { fields?: FieldDetail[] } };
    const apiData = data as ApiErrorShape;
    if (apiData.details && Array.isArray(apiData.details.fields)) {
      const fieldMsgs: string[] = [];
      for (const f of apiData.details.fields) {
        if (!f) continue;
        const path = typeof f.path === "string" ? f.path : null;
        const msg = typeof f.message === "string" ? f.message : null;
        if (path && msg) fieldMsgs.push(`${path}: ${msg}`);
        else if (msg) fieldMsgs.push(msg);
      }
      if (fieldMsgs.length > 0) return fieldMsgs.join("; ");
    }

    if (typeof apiData.message === "string") return apiData.message;
    if (typeof apiData.error === "string") return apiData.error;
  }

  if (typeof e?.message === "string") return e.message;

  return "An error occurred";
}
