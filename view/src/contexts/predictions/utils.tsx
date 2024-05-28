import { Actions, AllLoaded } from "./predictions.context.actions";
import { Prediction, Performance, AllLoadedStatus } from "./predictions.types";
import mainPrediction from './data/one.json';
import predictions from './data/data.json';
import performances from './data/performance.json'

export const transformPrediction = (): Prediction => {
  const [{date, call_one_day, put_one_day, call_two_day,put_two_day,call_one_day_vector,put_one_day_vector,call_two_day_vector,put_two_day_vector}] = mainPrediction;
  return {
    date: new Date(date),
    callOneDay: call_one_day, 
    putOneDay: put_one_day, 
    callTwoDay: call_two_day,
    putTwoDay: put_two_day,
    callOneDayVector: call_one_day_vector,
    putOneDayVector: put_one_day_vector,
    callTwoDayVector: call_two_day_vector,
    putTwoDayVector: put_two_day_vector
  }
};

export const transformPerformance = (): Performance => {
  const [{last_updated_at, one_day_predictions_call, one_day_predictions_put, one_day_predictions_vector_call, one_day_predictions_vector_put, two_day_predictions_call, two_day_predictions_put,two_day_predictions_vector_call, two_day_predictions_vector_put}] = performances
  return {
    date: new Date(last_updated_at),
    oneDayPredictionsCall: one_day_predictions_call,
    oneDayPredictionsPut: one_day_predictions_put,
    oneDayPredictionsVectorCall: one_day_predictions_vector_call,
    oneDayPredictionsVectorPut: one_day_predictions_vector_put,
    twoDayPredictionsCall: two_day_predictions_call,
    twoDayPredictionsPut: two_day_predictions_put,
    twoDayPredictionsVectorCall: two_day_predictions_vector_call,
    twoDayPredictionsVectorPut: two_day_predictions_vector_put
  }
}

export enum Stores {
  Predictions = 'Predictions',
  Performance = 'Performance'
}

export const fetchAll = async (dispatch: React.Dispatch<Actions>) => {
  try {
    dispatch(AllLoaded(AllLoadedStatus.IN_PROGRESS))
    await initDB()
    dispatch(AllLoaded(AllLoadedStatus.DONE))
  } catch(error) {
    dispatch(AllLoaded(AllLoadedStatus.TODO))
    console.error('Error fetching all JSON data:', error)
  }
}

export const INDEX_DB_VERSION = 1
export const INDEX_DB_NAME = 'myDB'

const initDB = () => {
  return new Promise((resolve, reject) => {
    let db: IDBDatabase;
    // open the connection - rename this later, assuming this is unique per domain
    const request = indexedDB.open(INDEX_DB_NAME, INDEX_DB_VERSION);
    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;

      const store = db.createObjectStore(Stores.Predictions, { keyPath: "date" });
      store.createIndex("date", "date", { unique: true });
    };
    request.onerror = (event) => {
      reject(new Error(`${event}`))
    };
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      seedDbStore(db).then(() => {
        db.close()
        resolve(true)
      })
    }
  });
};

const seedDbStore = (db: IDBDatabase) => {
  return new Promise((resolve) => {
    // Store values in the newly created objectStore.
    const predictionObjectStore = db
      .transaction(Stores.Predictions, "readwrite")
      .objectStore(Stores.Predictions);
    predictions.forEach((prediction) => {
      predictionObjectStore.put({
        date: prediction.date, // I don't think indexDB can have Date as a index
        at: parseFloat(prediction.at),
        high: parseFloat(prediction.high),
        low: parseFloat(prediction.low),
        callOneDay: prediction.call_one_day,
        putOneDay: prediction.put_one_day,
        callTwoDay: prediction.call_two_day,
        putTwoDay: prediction.put_two_day,
        callOneDayVector: prediction.call_one_day_vector,
        putOneDayVector: prediction.put_one_day_vector,
        callTwoDayVector: prediction.call_one_day_vector,
        putTwoDayVector: prediction.put_two_day_vector,
      });
    });
    resolve(true)
  })
}