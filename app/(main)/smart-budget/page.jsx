"use client";

import { getSmartSuggestions } from "@/actions/getSmartSuggestions";

const data = await getSmartSuggestions(defaultAccount?.id);

// Now use data.suggestions and render the table

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SmartBudgetPage() {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Income: 50000,
            Groceries: 6000,
            Transport: 2000,
            Eating_Out: 3000,
            Entertainment: 1500,
            Utilities: 2500,
            Healthcare: 1200,
            Education: 1800,
            Miscellaneous: 1000,
          }),
        });
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    };

    fetchSuggestions();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Smart Budget Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Category</th>
                <th>Last Month</th>
                <th>Predicted</th>
                <th>Recommended</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td>{row.category}</td>
                  <td>₹{row.lastMonth}</td>
                  <td>₹{row.predicted}</td>
                  <td>₹{row.recommended}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
