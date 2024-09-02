import pandas as pd
import sqlite3

con = sqlite3.connect("data/data.db")
cur = con.cursor()
cur.execute("SELECT date FROM trends")

db_data = cur.fetchall()
parsed_dates = [pd.to_datetime(date[0]).date() for date in db_data]

# Create a date range from the start to the end date in the data
start_date = min(parsed_dates)
end_date = max(parsed_dates)

# Generate all weekdays within the range (Market days)
all_days = pd.date_range(start=start_date, end=end_date, freq='B')  # 'B' frequency is for Business days (weekdays)

# Convert to a set for easier comparison
existing_days_set = set(parsed_dates)
market_days_set = set(all_days.date)

# Find missing days
missing_days = market_days_set - existing_days_set

for day in sorted(missing_days):  # Sort the missing days for better readability
  day_str = day.strftime("%Y/%m/%d")
  sql = """
    INSERT INTO trends (date)
    VALUES (?)
  """
  cur.execute(sql,(day_str,))
  con.commit()
  print(f"[-]\tInserted: {day_str} missing business day")

# Output any duplicate days
# Expecting 2022-03-01
sql = """
  SELECT DATE(REPLACE(date,'/','-')) as date_day, 
  count(*) as cnt from metadata group by date_day HAVING cnt > 1;
"""
cur.execute(sql)
results = cur.fetchall()
for row in results:
  print(f"[-]\tDuplicate Days, count: {row}")
cur.close()
con.close()