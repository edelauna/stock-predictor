import sqlite3

con = sqlite3.connect("data/data.db")
cur = con.cursor()

def set_labels(forward_days=1):
  if forward_days==1:
    call_label_name = 'one_day_call'
    put_label_name = 'one_day_put'
  else:
    call_label_name = 'two_day_call'
    put_label_name = 'two_day_put'
    
  cur.execute(f"SELECT date FROM trends where {call_label_name} IS NULL")
  trend_db = cur.fetchall()
  print(f"[-]\tFetched {len(trend_db)} rows to attempt to update {call_label_name} column")

  for item in trend_db:
    date = item[0]
    limit = forward_days + 1
    cur.execute("SELECT * from metadata WHERE date >= ? ORDER BY date ASC LIMIT ?", (date, limit))
    metadata_db = cur.fetchall()
    if(len(metadata_db) < limit):
      print(f"[-]\tNot all metadata is available to set lables for {date}")
      continue
    (_, at, _, _) = metadata_db[0]
    (_, _, high, low) = metadata_db[forward_days]
    call_label = float(high) - float(at)
    put_label = float(low) - float(at)

    sql = f"""
      INSERT INTO trends(date, {call_label_name}, {put_label_name}) 
      VALUES (?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
      {call_label_name} = excluded.{call_label_name},
      {put_label_name} = excluded.{put_label_name}
    """
    cur.execute(sql, (date, call_label, put_label))
    con.commit()
    print(f"[-]\tUpserted labels for {date}")

set_labels(forward_days=1)
set_labels(forward_days=2)

cur.close()
con.close()