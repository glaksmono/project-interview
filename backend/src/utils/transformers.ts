export const numericTransformer = {
  to: (
    value: number | string | null | undefined
  ): number | string | null | undefined => value,
  from: (value: string | number | null | undefined): number | string | null => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") return value;

    if (typeof value === "string") {
      // basic numeric format check
      if (!/^[+-]?\d+(?:\.\d+)?$/.test(value)) {
        throw new Error(`Invalid numeric value: ${value}`);
      }

      // integer case (no decimal point)
      if (/^[+-]?\d+$/.test(value)) {
        const digits = value.replace(/^[+-]/, "");
        // DB columns in this repo commonly use precision 15, scale 0.
        // If the integer length is <= 15 we can safely convert to Number
        // for arithmetic without losing the DB-stored precision.
        if (digits.length <= 15) {
          const parsed = Number(value);
          if (!Number.isFinite(parsed)) {
            throw new Error(`Invalid numeric value: ${value}`);
          }
          return parsed;
        }
        // Otherwise leave as string to avoid precision loss.
        return value as unknown as number;
      }

      // decimal numbers: return string to avoid rounding in JS Number
      return value as unknown as number;
    }

    return null;
  },
};
