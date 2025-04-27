"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils"; // Import the formatCurrency function

const PredictionCard = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch("/api/forecast");
        const { data } = await res.json();
        setChartData(data);
      } catch (err) {
        console.error("Error fetching prediction data", err);
      }
    };

    fetchPrediction();
  }, []);

  if (chartData.length === 0) {
    return null; // Or show loading spinner
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monthly Spending Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div style={{ width: 900, height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} /> {/* Use formatCurrency */}
                <Line
                  type="monotone"
                  dataKey="spending"
                  stroke="#4ade80"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-sm mt-4 text-muted-foreground text-center">
          Predicted next month: {formatCurrency(chartData.at(-1)?.spending || "—")} {/* Use formatCurrency */}
        </p>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
