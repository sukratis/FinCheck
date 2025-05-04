

import { db } from "../lib/prisma.js";
import { subDays } from "date-fns";

const ACCOUNT_ID = "563a138b-376e-442e-8d0d-83e12dce21af";
const USER_ID = "bd3a4bcd-213b-40f0-9e9a-707c7d7c6ce3";

// Categories with their typical amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

export async function seedTransactions() {
  try {
    // Get start and end of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = [];
    let totalBalance = 0;

    // Generate transactions for each day of the current month
    const daysInMonth = endOfMonth.getDate();
    for (let i = 0; i < daysInMonth; i++) {
      const date = new Date(startOfMonth);
      date.setDate(i + 1);

      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${
            type === "INCOME" ? "Received" : "Paid for"
          } ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        };

        totalBalance += type === "INCOME" ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Insert new transactions only (optional: don't delete existing ones)
    await db.$transaction(async (tx) => {
      // OPTIONAL: delete only this month's existing transactions
      await tx.transaction.deleteMany({
        where: {
          accountId: ACCOUNT_ID,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance (optional)
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions for this month`,
    };
  } catch (error) {
    console.error("Error seeding this month's transactions:", error);
    return { success: false, error: error.message };
  }
}

seedTransactions().then(console.log).catch(console.error);

