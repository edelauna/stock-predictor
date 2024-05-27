import React, { createContext, useEffect, useReducer } from "react";
import { AllLoadedStatus, Prediction, Performance } from "./predictions.types";
import { ActionType, Actions } from "./predictions.context.actions";
import { fetchAll, transformPerformance, transformPrediction } from "./utils";

export interface PredictionStoreState {
  mainPrediction: Prediction;
  performance: Performance
  allLoaded: AllLoadedStatus
};

const localStorageAllLoadedKey = 'state-all-loaded-local-storage'
const localStorageAllLoadedValue = localStorage.getItem(localStorageAllLoadedKey) as AllLoadedStatus

const initialState = {
  allLoaded: localStorageAllLoadedValue ? localStorageAllLoadedValue : AllLoadedStatus.TODO,
  mainPrediction: transformPrediction(),
  performance: transformPerformance()
};

type PredictionContext = {
  state: PredictionStoreState;
  dispatch: React.Dispatch<Actions>;
};

export const store = createContext<PredictionContext>({
  state: initialState,
  dispatch: () => null,
});

const reducer: React.Reducer<PredictionStoreState, Actions> = (
  state: PredictionStoreState,
  action: Actions,
) => {
  switch (action.type) {
    case ActionType.AddMain:
      return {
        ...state,
        mainPrediction: action.payload
      };
    case ActionType.AllLoaded:
      return { 
        ...state, 
        allLoaded: action.payload
      };
    default:
      return state;
  }
};

const { Provider } = store;

export const PredictionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * side effect - testing saving to localStorage
   */
  useEffect(() => {
    localStorage.setItem(localStorageAllLoadedKey, state.allLoaded)
    if(state.allLoaded === AllLoadedStatus.TODO)
      fetchAll(dispatch);
  }, [state])

  return <Provider value={{ state, dispatch }} children={children} />;
};
