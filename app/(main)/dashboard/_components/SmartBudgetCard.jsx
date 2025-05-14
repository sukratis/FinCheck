"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function SmartBudgetCard() {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = await fetch("/api/smart-budget");
        const data = await res.json();

        if (data.success) {
          setPrediction(data.prediction.prediction); // match backend response
        } else {
          setPrediction("Error: " + data.message);
        }
      } catch (err) {
        setPrediction("Fetch failed");
      } finally {
        setLoading(false);
      }
    }

    fetchPrediction();
  }, []);

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">🧠 Smart Budget Suggestion</h3>
        {loading ? (
          <p>Loading prediction...</p>
        ) : (
          <p>
            Suggested Monthly Budget:{" "}
            <span className="font-bold text-green-600">
              ₹{prediction}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

