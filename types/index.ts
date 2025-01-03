import { insertProductSchema } from "@/lib/validitors";
import { z } from "zod";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  ratting: number;
  createdAt: Date;
};
