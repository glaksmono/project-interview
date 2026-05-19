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
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Invalid numeric value: ${value}`);
    }
    return parsed;
  },
};
