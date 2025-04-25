"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Monthly Spending Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="spending"
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm mt-2 text-muted-foreground text-center">
          Predicted next month: ₹{chartData.at(-1)?.spending || "—"}
        </p>
      </CardContent>
    </Card>
  );
};

export default PredictionCard;

