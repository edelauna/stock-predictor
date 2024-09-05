import requests
import os
import sqlite3
from datetime import datetime, time
import pytz
import dateutil.parser
from joblib import Memory

# Placing at the top of file since cache gets busted if line changed.
API_CACHE="data/.av"
memory = Memory(API_CACHE, verbose=0)

@memory.cache
def get_av_data(url, key):
  # socks_proxy = "socks5://localhost:9090"
  # r = requests.get(url, proxies={"http": socks_proxy, "https": socks_proxy})
  r = requests.get(url)
  data =  r.json()
  print(f"[-]\tFetched up to {key}: {list(data[key].keys())[-1]}")
  return data

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

monthly_metadata_map = {}
cur.execute("""
            SELECT t.date FROM trends t
            LEFT JOIN metadata m ON t.date = m.date
            WHERE one_day_call IS NULL
            AND m.date is NULL
            """)
db_data = cur.fetchall()
print(f"[-]\tFetched {len(db_data)} rows.")
for item in db_data:
  date = item[0]
  parsed = dateutil.parser.parse(date)
  
  year_month = parsed.strftime("%Y-%m")
  if year_month not in monthly_metadata_map:
    metadata_map = {}
  else:
    metadata_map = monthly_metadata_map[year_month]
  
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
  monthly_metadata_map[year_month] = metadata_map

api_key = os.getenv("AV_API_KEY")

SYMBOL = 'SPY'  

for year_month in monthly_metadata_map:

  url = (
    'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&'
    f"symbol={SYMBOL}&"
    f"month={year_month}&"
    'interval=1min&extended_hours=false&'
    f"apikey={api_key}&outputsize=full"
  )
  TIMESERIES_KEY='Time Series (1min)'
  data = get_av_data(url, TIMESERIES_KEY)

  metadata_map = monthly_metadata_map[year_month]
  for key in list(metadata_map.keys()):
    k = metadata_map[key]['time_at']['key']
    value = data[TIMESERIES_KEY].get(k)
    if value:
      metadata_map[key]['time_at']['value'] = value['4. close']
    else:
      print(f"[-]\tNo {TIMESERIES_KEY} data for: {k}, trying to use day's close")
      parsed = dateutil.parser.parse(k)
      adjusted_datetime = parsed.replace(hour=15, minute=59)
      k = adjusted_datetime.strftime("%Y-%m-%d %H:%M:%S")
      try:
        metadata_map[key]['time_at']['value'] = data[TIMESERIES_KEY][k]['4. close']
      except KeyError:
        print(f"[-]\tNo {TIMESERIES_KEY} data for: {key} removing from metadata_map")
        del metadata_map[key]

url = (
  'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&'
  f"symbol={SYMBOL}&"
  'outputsize=full&'
  f"apikey={api_key}&cache_buster={current_datetime.date()}"
)

TIMESERIES_KEY='Time Series (Daily)'
data = get_av_data(url, TIMESERIES_KEY)

upserted = 0

for year_month in monthly_metadata_map:
  metadata_map = monthly_metadata_map[year_month]

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
  _upserted = len(metadata_map.keys())
  print(f"[-]\tUpserted: {_upserted} new rows")
  upserted += _upserted
cur.close()
con.close()

# todo - add a flag in trends db to prevent this
if(upserted == 0):
  print(f"[-]\tSetting Error Code 7 for CI - no new data.")
  exit(7)