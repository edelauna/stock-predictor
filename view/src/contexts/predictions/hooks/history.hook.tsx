import React, { useEffect, useState } from "react";
import { PredictionStoreState } from "..";
import { Actions, UpdateCursor, UpdateHistory } from "../predictions.context.actions";
import { INDEX_DB_NAME, INDEX_DB_VERSION, Stores } from "../utils";
import { AllLoadedStatus } from "../predictions.types";

export const useStoreSideEffect = (
  state: PredictionStoreState,
  dispatch: React.Dispatch<Actions>,
  date: Date | null,
  limit: number
) => {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const {allLoaded, cursor} = state

  useEffect(() => {
    const fetchDate = async () => {
      setLoading(true)
      let _limit = limit
      let db: IDBDatabase;
      // open the connection - rename this later, assuming this is unique per domain
      const request = indexedDB.open(INDEX_DB_NAME, INDEX_DB_VERSION);
      request.onerror = (event) => {
        const msg = `useStoreSideEffect::error::${event}`
        console.error(msg)
        setError(msg)
      };
      request.onsuccess = (event) => {
        db = (event.target as IDBOpenDBRequest).result;
        // date should always exists since it's being checked for equality with cursor which will always be a date
        const lowerBoundKeyRange = IDBKeyRange.lowerBound(dateTransformer(date!), true);
        const objectStore = db.transaction(Stores.Predictions).objectStore(Stores.Predictions);
        const index = objectStore.index("date");
        let prevCursor;
        index.openCursor(lowerBoundKeyRange).onsuccess = (event) => {
          const cursor_db = (event.target as IDBRequest).result;
          if (cursor_db) {
            prevCursor = new Date(cursor_db.value.date)
            if(_limit > 0){
              _limit--;
              dispatch(UpdateHistory({...cursor_db.value, date: prevCursor}))
              cursor_db.continue();
            } else {
              dispatch(UpdateCursor(prevCursor))
              db.close()
            }
          }
        };
      }
      setLoading(false)
    };
    if(allLoaded === AllLoadedStatus.DONE && cursor === date){
      fetchDate();
    }
  }, [dispatch, date, limit, allLoaded, cursor]);
  return { loading, error, cursor };
};

const dateTransformer = (date: Date) => {
  return date.toISOString().split('T')[0].replace(/-/g, '/');
}