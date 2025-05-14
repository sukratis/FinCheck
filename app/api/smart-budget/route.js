// app/api/smart-budget/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    // 1. Fetch real user transactions from Supabase
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*");

    if (error) throw new Error("Failed to fetch transactions from Supabase");

    // 2. Send real transaction data to FastAPI ML model
    const response = await fetch("http://localhost:8000/predict-budget", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactions }),
    });

    if (!response.ok) {
      throw new Error("FastAPI model request failed");
    }

    const prediction = await response.json();

    // 3. Return prediction to the frontend
    return NextResponse.json({ success: true, prediction });
  } catch (err) {
    console.error("Smart Budget API Error:", err.message);
    return NextResponse.json({ success: false, message: err.message });
  }
}

