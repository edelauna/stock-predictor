import pandas as pd
import sqlite3
import numpy as np
from ast import literal_eval
import dateutil.parser
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline, FunctionTransformer
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.multioutput import RegressorChain

con = sqlite3.connect("data/data.db")
cur = con.cursor()
ONE_DAY_TABLE_NAME='one_day_predictions_vector'
TWO_DAY_TABLE_NAME='two_day_predictions_vector'
for table_name in [ONE_DAY_TABLE_NAME, TWO_DAY_TABLE_NAME]:
  # cur.execute(f"DROP TABLE {table_name}")
  cur.execute(f"CREATE TABLE IF NOT EXISTS {table_name}(date, call, put)")

def build_model():
  # Feature Extraction
  text_preprocess = Pipeline([
      ('count', CountVectorizer(analyzer='char_wb', ngram_range=(1,14))),
      ('transform', TfidfTransformer())
  ])
  def date_to_day_of_week(x):
    x['date'] = x['date'].apply(lambda row: dateutil.parser.parse(row).weekday())
    return x
  
  # Combine text feature extraction with day_of_week feature
  ct = ColumnTransformer([
      ('text', text_preprocess, 'text'),
      ('dow', FunctionTransformer(lambda x: date_to_day_of_week(x)), ['date'])
  ])

  # Add the final regressor to the pipeline
  return Pipeline([
      ('features', ct),
      ('reg', RegressorChain(base_estimator=RandomForestRegressor()))
  ])

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
                SELECT date, text, {call_name}, {put_name} FROM trends 
                WHERE {call_name} IS NOT NULL AND date < ?
                """, (date, ))
    db_x = cur.fetchall()
    db_data_df = pd.DataFrame(db_x, columns=["date", "text", call_name, put_name])
    db_data_df['label'] = db_data_df[[call_name, put_name]].apply(lambda row: np.array(row), axis=1)
    t = np.vstack(db_data_df['label'])  
    model = build_model()
    print(f"[-]\tFitting model with len(X):{len(db_data_df)} records")
    model.fit(db_data_df, t)
    cur.execute("SELECT date, text FROM trends where date = ?", (date, ))
    db_predict = cur.fetchall()
    predict_df = pd.DataFrame(db_predict, columns=["date", "text"])
    pred = model.predict(predict_df)[0]
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