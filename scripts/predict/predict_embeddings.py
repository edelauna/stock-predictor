import pandas as pd
import sqlite3
import numpy as np
from ast import literal_eval
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor

con = sqlite3.connect("data/data.db")
cur = con.cursor()
ONE_DAY_TABLE_NAME='one_day_predictions'
TWO_DAY_TABLE_NAME='two_day_predictions'
for table_name in [ONE_DAY_TABLE_NAME, TWO_DAY_TABLE_NAME]:
  #cur.execute(f"DROP TABLE {table_name}")
  cur.execute(f"CREATE TABLE IF NOT EXISTS {table_name}(date, call, put)")

def pred(table_name=ONE_DAY_TABLE_NAME):
  cur.execute(f"SELECT date FROM trends where trends.date NOT IN (SELECT date from {table_name}) AND trends.date > '2024/05/15' ORDER BY date DESC LIMIT 15")

  db_data = cur.fetchall()
  if(len(db_data) == 0):
    print(f"[-]\tExiting no {table_name} predictions missing.")
    return

  if(table_name==ONE_DAY_TABLE_NAME):
    call_name = 'one_day_call'
    put_name = 'one_day_put'
  else:
    call_name = 'two_day_call'
    put_name = 'two_day_put'

  for item in db_data:
    (date, ) = item
    cur.execute(f"""
                SELECT date, embeddings, {call_name}, {put_name} FROM trends 
                WHERE {call_name} IS NOT NULL AND date < ?
                """, (date, ))
    db_x = cur.fetchall()
    db_data_df = pd.DataFrame(db_x, columns=["date", "embeddings", call_name, put_name])
    db_data_df.embeddings = db_data_df.embeddings.apply(lambda x: np.array(literal_eval(x)))
    db_data_df['label'] = db_data_df[[call_name, put_name]].apply(lambda row: np.array(row), axis=1)
    X = list(db_data_df.embeddings.values)
    t = np.vstack(db_data_df['label'])  
    model = MultiOutputRegressor(estimator=RandomForestRegressor())
    print(f"[-]\tFitting model with len(X):{len(X)} records")
    model.fit(X, t)
    cur.execute("SELECT embeddings FROM trends where date = ?", (date, ))
    (pred_data, ) = cur.fetchall()[0]
    pred = model.predict(np.array(literal_eval(pred_data)).reshape(1,-1))[0]
    [call, put] = pred
    print(f"[-]\tPredicting {date}:{call_name}:{put_name}\t=> {pred}")
    sql = f"INSERT INTO {table_name} (date, call, put) VALUES (?, ?, ?)"
    data = (date, call, put) 
    cur.execute(sql, data)
    con.commit()

pred(ONE_DAY_TABLE_NAME)
pred(TWO_DAY_TABLE_NAME)

cur.close()
con.close()