"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { request } from "@arcjet/next";
import arcjet from "@/lib/arcjet-sdk"; // correct usage here


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = Number(obj.balance);
  }
  if (obj.amount) {
    serialized.amount = Number(obj.amount);
  }
  return serialized;
};

export async function getUserAccounts(userId) {
  if (!userId) throw new Error("Unauthorized");

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("clerkUserId", userId)
    .single();

  if (userError || !userData) {
    throw new Error("User not found");
  }

  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("*, transactions(count)")
    .eq("userId", userData.id)
    .order("createdAt", { ascending: false });

  if (error) throw new Error("Failed to fetch accounts");

  return accounts.map((account) => ({
    ...serializeTransaction(account),
    _count: {
      transactions: account.transactions?.length || 0,
    },
  }));
}

export async function createAccount(data) {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request(); // Get full edge request object
    const decision = await arcjet.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: { remaining, resetInSeconds: reset },
        });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("clerkUserId", userId)
      .single();

    if (userError || !userData) throw new Error("User not found");

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    const { data: existingAccounts, error: accountsError } = await supabase
      .from("accounts")
      .select("*")
      .eq("userId", userData.id);

    if (accountsError) throw new Error("Failed to check existing accounts");

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    if (shouldBeDefault) {
      await supabase
        .from("accounts")
        .update({ isDefault: false })
        .eq("userId", userData.id)
        .eq("isDefault", true);
    }

    const { data: newAccount, error: createError } = await supabase
      .from("accounts")
      .insert([
        {
          ...data,
          balance: balanceFloat,
          userId: userData.id,
          isDefault: shouldBeDefault,
        },
      ])
      .select()
      .single();

    if (createError) throw new Error("Failed to create account");

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(newAccount) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData(userId) {
  if (!userId) throw new Error("Unauthorized");

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("clerkUserId", userId)
    .single();

  if (userError || !userData) {
    throw new Error("User not found");
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("userId", userData.id)
    .order("date", { ascending: false });``

  if (error) {
    throw new Error("Failed to fetch transactions");
  }

  return transactions.map(serializeTransaction);
}
