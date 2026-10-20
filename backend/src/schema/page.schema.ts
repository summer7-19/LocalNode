import z from 'zod'

export const pageSchema = z.preprocess((input) => {
  if (typeof input === 'object' && input !== null) {
    const { pageSize, ...rest } = input as any;
    return { ...rest, size: pageSize !== undefined ? pageSize : rest.size };
  }
  return input;
}, z.object({
  page: z.coerce.number().min(1).default(1),
  size: z.coerce.number().min(1).max(100).default(20)
}));
