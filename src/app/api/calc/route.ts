import { calculatePackPrice } from "@/ai";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await calculatePackPrice(body);

  return Response.json(result);
    }