import sqlite3
from datetime import datetime
import pytz
import dateutil.parser

con = sqlite3.connect("data/data.db")
cur = con.cursor()

ONE_DAY_TABLE_NAME='one_day_predictions'
TWO_DAY_TABLE_NAME='two_day_predictions'
V_ONE_DAY_TABLE_NAME='one_day_predictions_vector'
V_TWO_DAY_TABLE_NAME='two_day_predictions_vector'

#cur.execute(f"DROP TABLE performance")
cur.execute(f"""
            CREATE TABLE IF NOT EXISTS performance(
              last_updated_at PRIMARY KEY, 
              {ONE_DAY_TABLE_NAME}_call,
              {ONE_DAY_TABLE_NAME}_put,
              {V_ONE_DAY_TABLE_NAME}_call,
              {V_ONE_DAY_TABLE_NAME}_put,
              {TWO_DAY_TABLE_NAME}_call,
              {TWO_DAY_TABLE_NAME}_put,
              {V_TWO_DAY_TABLE_NAME}_call,
              {V_TWO_DAY_TABLE_NAME}_put
            )
            """)

cur.execute("SELECT last_updated_at FROM performance ORDER BY last_updated_at DESC LIMIT 1")
db_data = cur.fetchall()
last_updated_at = db_data[0][0]
last_updated_at_parsed = dateutil.parser.parse(last_updated_at)
cur.execute("SELECT date FROM one_day_predictions_vector ORDER BY date DESC LIMIT 1")
db_data = cur.fetchall()
pred_date = db_data[0][0]
pred_date_parsed = dateutil.parser.parse(pred_date)

if(pred_date_parsed <= last_updated_at_parsed):
  print(f"[+] Exiting: Last prediction date of {pred_date_parsed} <= Last Performance Record {last_updated_at_parsed}")
  exit()

current_date = pred_date_parsed.strftime("%Y-%m-%d")


def results(table_name=ONE_DAY_TABLE_NAME):
  if(table_name==ONE_DAY_TABLE_NAME or table_name == V_ONE_DAY_TABLE_NAME):
    call_name = 'one_day_call'
    put_name = 'one_day_put'
  else:
    call_name = 'two_day_call'
    put_name = 'two_day_put'

  cur.execute(f"""
              SELECT trends.date, {call_name}, {put_name}, call, put FROM trends 
              JOIN {table_name} ON trends.date = {table_name}.date
              WHERE {call_name} is NOT NULL
              """)
  db_data = cur.fetchall()
  mse_call = 0
  mse_put = 0
  for item in db_data:
    (_, call_actual, put_actual, call_predicted, put_predicted) = item
    mse_call += (call_actual - call_predicted) ** 2
    mse_put += (put_actual - put_predicted) ** 2
  mse_call /= len(db_data)
  mse_put /= len(db_data)
  print(f"[-]\t{table_name}:\tMSE - Call:{mse_call}\tMSE - Put:{mse_put}")
  sql = f"""
    INSERT INTO performance (last_updated_at, {table_name}_call, {table_name}_put) VALUES (?, ?, ?)
    ON CONFLICT(last_updated_at) DO UPDATE SET
    {table_name}_call = excluded.{table_name}_call,
    {table_name}_put = excluded.{table_name}_put
  """
  data = (current_date, mse_call, mse_put) 
  cur.execute(sql, data)
  con.commit()

for table_name in [ONE_DAY_TABLE_NAME, TWO_DAY_TABLE_NAME, V_ONE_DAY_TABLE_NAME, V_TWO_DAY_TABLE_NAME]:
  results(table_name)


cur.close()
con.close()

