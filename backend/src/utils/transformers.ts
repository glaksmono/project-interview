/**
 * Transformer for PostgreSQL NUMERIC columns.
 * node-postgres returns NUMERIC as strings; this converts them to JS numbers.
 */
export const numericTransformer = {
  to: (value: number | null | undefined): number | null | undefined => value,
  from: (value: string | number | null | undefined): number | null => {
    // Left joins can hydrate relation columns as NULL before TypeORM
    // resolves the relation as absent.
    if (value === null || value === undefined) {
      return null;
    }
    // Postgres returns NUMERIC as string. We want to avoid precision loss
    // but also avoid runtime bugs from string + number concatenation.
    // Strategy (minimal):
    // - If the value is already a number, return it.
    // - If it's a purely-integer string and its digit count <= 15, safely
    //   convert to Number (fits DB precision and JS safe integer range here).
    // - Otherwise (decimals or very large integers), return the original
    //   string to preserve precision and avoid rounding.
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
