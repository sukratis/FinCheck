"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const ForecastCard = () => {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchTransactions = async () => {
    const user = (await supabase.auth.getUser()).data.user
    const { data, error } = await supabase
      .from('transactions')
      .select('date, amount')
      .eq('user_id', user.id)

    if (error) {
      console.error('Supabase fetch error:', error)
      return []
    }

    console.log('Fetched Transactions:', data) // Log transactions
    return data.map(txn => ({
      date: txn.date,
      amount: parseFloat(txn.amount)
    }))
  }

  const getForecast = async () => {
    const txns = await fetchTransactions()
    if (!txns.length) {
      setLoading(false)
      return
    }

    const res = await fetch('http://127.0.0.1:5000/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txns)
    })

    const result = await res.json()
    console.log('API Forecast Result:', result) // Log the API response

    setPrediction(result.total_predicted?.toFixed(2))
    setLoading(false)
  }

  useEffect(() => {
    getForecast()
  }, [])

  return (
    <div className="bg-white p-4 rounded shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-2">📈 Forecast</h2>
      {loading ? (
        <p>Loading forecast...</p>
      ) : prediction ? (
        <p className="text-green-600">
          Predicted total spending next month: ₹{prediction}
        </p>
      ) : (
        <p>No prediction available.</p>
      )}
    </div>
  )
}

export default ForecastCard


