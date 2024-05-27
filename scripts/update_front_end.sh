#!/bin/bash

# run this from main ../scripts/update_front_end
DATA_PATH=data/data.db

sqlite3 $DATA_PATH '.mode json' '.once view/src/contexts/predictions/data/one.json' 'select 
one_day_predictions.date,
one_day_predictions.call as call_one_day,
one_day_predictions.put as put_one_day,
two_day_predictions.call as call_two_day,
two_day_predictions.put as put_two_day,
one_day_predictions_vector.call as call_one_day_vector,
one_day_predictions_vector.put as put_one_day_vector,
two_day_predictions_vector.call as call_two_day_vector,
two_day_predictions_vector.put as put_two_day_vector
from one_day_predictions 
JOIN two_day_predictions ON one_day_predictions.date = two_day_predictions.date
JOIN one_day_predictions_vector ON one_day_predictions.date = one_day_predictions_vector.date
JOIN two_day_predictions_vector ON one_day_predictions.date = two_day_predictions_vector.date
ORDER BY one_day_predictions.date DESC LIMIT 1'
sqlite3 $DATA_PATH '.mode json' '.once view/src/contexts/predictions/data/performance.json' 'select * from performance ORDER BY last_updated_at DESC LIMIT 1'
sqlite3 $DATA_PATH '.mode json' '.once view/src/contexts/predictions/data/data.json' 'select 
metadata.date,
at,
high,
low,
one_day_predictions.call as call_one_day,
one_day_predictions.put as put_one_day,
two_day_predictions.call as call_two_day,
two_day_predictions.put as put_two_day,
one_day_predictions_vector.call as call_one_day_vector,
one_day_predictions_vector.put as put_one_day_vector,
two_day_predictions_vector.call as call_two_day_vector,
two_day_predictions_vector.put as put_two_day_vector
from metadata 
JOIN one_day_predictions ON metadata.date = one_day_predictions.date
JOIN two_day_predictions ON metadata.date = two_day_predictions.date
JOIN one_day_predictions_vector ON metadata.date = one_day_predictions_vector.date
JOIN two_day_predictions_vector ON metadata.date = two_day_predictions_vector.date'