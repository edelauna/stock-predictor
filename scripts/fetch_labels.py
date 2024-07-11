import requests
import os
import sqlite3
from datetime import datetime, time
import pytz
import dateutil.parser

current_datetime = datetime.now(pytz.timezone('US/Eastern'))


con = sqlite3.connect("data/data.db")
cur = con.cursor()
#cur.execute("DROP TABLE metadata")
cur.execute("CREATE TABLE IF NOT EXISTS metadata(date PRIMARY KEY, at, high, low)")
cur.execute("SELECT max(date) FROM trends where one_day_call IS NULL AND date NOT IN (SELECT date FROM metadata)")

db_data = cur.fetchall()
date = db_data[0][0]
if(date is None):
  print(f"[-]\tExiting no new data.")
  exit(7)
max_datetime_est = dateutil.parser.parse(date)
if (current_datetime.date() == max_datetime_est.date()):
  after_hours_cutoff = time(20, 0)
  if (current_datetime.time() < after_hours_cutoff):
    print(f"[-]\tAborting for {current_datetime.date()} since market not yet closed")
    exit(7)

metadata_map = {}
cur.execute("SELECT date FROM trends where one_day_call IS NULL")
db_data = cur.fetchall()
print(f"[-]\tFetched {len(db_data)} rows.")
for item in db_data:
  date = item[0]
  parsed = dateutil.parser.parse(date)
  metadata_map[date] = {
    'time_at': {
      'key': parsed.strftime("%Y-%m-%d %H:%M:%S"),
      'value' : 0,
    },
    'eod': {
      'key' : parsed.strftime("%Y-%m-%d"),
      'high': 0,
      'low': 0
    }
  }

api_key = os.getenv("AV_API_KEY")

SYMBOL = 'SPY'

url = (
  'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&'
  f"symbol={SYMBOL}&"
  'interval=1min&extended_hours=false&'
  f"apikey={api_key}&outputsize=full"
)
r = requests.get(url)
data = r.json()
TIMESERIES_KEY='Time Series (1min)'
print(f"[-]\tFetched up to Time Series (1min): {list(data[TIMESERIES_KEY].keys())[-1]}")

for key in metadata_map:
  k = metadata_map[key]['time_at']['key']
  value = data[TIMESERIES_KEY].get(k)
  if value:
    metadata_map[key]['time_at']['value'] = value['4. close']
  else:
    print(f"[-]\tNo {TIMESERIES_KEY} data for: {k}, trying to use day's close")
    parsed = dateutil.parser.parse(k)
    adjusted_datetime = parsed.replace(hour=15, minute=59)
    k = adjusted_datetime.strftime("%Y-%m-%d %H:%M:%S")
    metadata_map[key]['time_at']['value'] = data[TIMESERIES_KEY][k]['4. close']

url = (
  'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&'
  f"symbol={SYMBOL}&"
  f"apikey={api_key}"
)
r = requests.get(url)
data = r.json()

TIMESERIES_KEY='Time Series (Daily)'
print(f"[-]\tFetched up to Time Series (Daily): {list(data[TIMESERIES_KEY].keys())[-1]}")
for key in metadata_map:
  k = metadata_map[key]['eod']['key']
  metadata_map[key]['eod']['high'] = data[TIMESERIES_KEY][k]['2. high']
  metadata_map[key]['eod']['low'] = data[TIMESERIES_KEY][k]['3. low']
# getting high and lows

sql = """
INSERT INTO metadata(date, at, high, low) 
VALUES (?, ?, ?, ?)
ON CONFLICT(date) DO UPDATE SET
at = excluded.at,
high = excluded.high,
low = excluded.low
"""
for key in metadata_map:
    cur.execute(sql, (
      key,
      metadata_map[key]['time_at']['value'],
      metadata_map[key]['eod']['high'],
      metadata_map[key]['eod']['low']
    ))
con.commit()
print(f"[-]\tUpserted: {len(metadata_map.keys())} new rows")
cur.close()
con.close()