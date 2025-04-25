import pandas as pd
from prophet import Prophet

def generate_forecast(transactions):
    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df = df.groupby('date').sum().reset_index()
    df = df.rename(columns={'date': 'ds', 'amount': 'y'})

    model = Prophet()
    model.fit(df)

    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    forecast_data = forecast[['ds', 'yhat']].tail(30)
    return {
        'forecast': forecast_data.to_dict(orient='records'),
        'total_predicted': forecast_data['yhat'].sum()
    }
