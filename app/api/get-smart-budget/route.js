// app/api/smart-budget/route.js

import { NextResponse } from "next/server";
import * as tf from '@tensorflow/tfjs'; // if using deep learning
import { createClient } from '@supabase/supabase-js';
import { predictBudget } from '@/lib/ml/predict_budget'; // We'll create this next

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    // 1. Fetch user's spending data from Supabase
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*');

    if (error) throw error;

    // 2. Pass the transactions into the ML model
    const prediction = await predictBudget(transactions);

    // 3. Return prediction
    return NextResponse.json({ success: true, prediction });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message });
  }
}
