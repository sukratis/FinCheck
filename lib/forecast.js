import { db } from "@/lib/prisma";
import dayjs from "dayjs";

export async function getPrediction() {
  const now = dayjs();
  const months = [];

  // Get the last 4 months of spending
  for (let i = 3; i >= 0; i--) {
    const start = now.subtract(i, "month").startOf("month").toDate();
    const end = now.subtract(i, "month").endOf("month").toDate();

    const transactions = await db.transaction.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const total = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    months.push({
      name: now.subtract(i, "month").format("MMM"),
      spending: Number(total.toFixed(2)),
    });
  }

  // Dummy predicted value (replace with ML later)
  const predictedValue = 5000.75;

  months.push({
    name: now.add(1, "month").format("MMM"),
    spending: Number(predictedValue.toFixed(2)),
    predicted: true, // Optional flag
  });

  return months;
}
