import { seedTransactions } from "@/actions/seed.mjs";

export async function GET() {
  const result = await seedTransactions();
  return Response.json(result);
}
