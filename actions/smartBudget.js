"use server";

import { db } from "@/lib/prisma.js";
import { auth } from "@clerk/nextjs/server";

export async function getSmartSuggestions(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        accountId,
        type: "EXPENSE",
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    });

    const categoryTotals = {};
    for (const txn of transactions) {
      const cat = txn.category || "Uncategorized";
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += txn.amount.toNumber();
    }

    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      body: JSON.stringify({ category_totals: categoryTotals }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Smart suggestion error:", error);
    return { error: error.message };
  }
}

