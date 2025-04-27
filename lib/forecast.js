import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getPrediction() {
  // 1. Fetch all transactions
  const { data: transactions, error } = await supabase
    .from('transactions')  // Your table name
    .select('amount, date'); // Only get amount and date

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  // 2. Group by month
  const monthlyTotals = {};

  transactions.forEach((tx) => {
    const month = dayjs(tx.date).format('YYYY-MM');
    monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
  });

  const sortedMonths = Object.keys(monthlyTotals).sort();

  // 3. Prepare data for ML
  const X = [];
  const y = [];

  sortedMonths.forEach((month, index) => {
    X.push(index + 1); // Month number
    y.push(monthlyTotals[month]); // Total spending
  });

  if (X.length < 2) {
    console.error("Not enough data to predict!");
    return [];
  }

  // 4. Train Simple Linear Regression (manually, no library)
  const n = X.length;
  const sumX = X.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = X.reduce((acc, val, idx) => acc + val * y[idx], 0);
  const sumX2 = X.reduce((acc, val) => acc + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const nextMonthX = X.length + 1;
  const predictedSpending = slope * nextMonthX + intercept;

  // 5. Format output for Chart
  const chartData = sortedMonths.map((month) => ({
    name: month,
    spending: monthlyTotals[month],
  }));

  chartData.push({
    name: "Next Month",
    spending: Math.round(predictedSpending),
  });

  return chartData;
}


