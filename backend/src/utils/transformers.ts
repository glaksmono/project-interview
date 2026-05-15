/**
 * Transformer for PostgreSQL NUMERIC columns.
 * node-postgres returns NUMERIC as strings; this converts them to JS numbers.
 */
export const numericTransformer = {
  to: (value: number): number => value,
  from: (value: string | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return parseFloat(value);
  },
};
