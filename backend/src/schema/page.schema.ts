import z from "zod"

export const pageSchema=z.object({
    page:z.coerce.number().min(1).default(1),
    size:z.coerce.number().min(1).max(100).default(20),
})