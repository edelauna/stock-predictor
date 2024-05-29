import React, { createContext, useEffect, useReducer } from "react";
import { AllLoadedStatus, Prediction, Performance } from "./predictions.types";
import { ActionType, Actions } from "./predictions.context.actions";
import { fetchAll, transformPerformance, transformPrediction } from "./utils";

export interface PredictionStoreState {
  mainPrediction: Prediction;
  performance: Performance
  allLoaded: AllLoadedStatus
  history: Prediction[]
  cursor: Date
  useWordVectors: boolean
};

const initialState = {
  allLoaded: AllLoadedStatus.TODO,
  mainPrediction: transformPrediction(),
  performance: transformPerformance(),
  history: [],
  cursor: new Date(),
  useWordVectors: false
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
    case ActionType.UpdateHistory:
      return {
        ...state,
        history: [...state.history, action.payload]
      };
    case ActionType.UpdateCursor:
      return {
        ...state,
        cursor: action.payload,
      }
    case ActionType.ResetHistory:
      return {
        ...state,
        history: []
      }
    case ActionType.UseWordVectors:
        return {
          ...state,
          useWordVectors: !state.useWordVectors
        }
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
    if(state.allLoaded === AllLoadedStatus.TODO)
      fetchAll(dispatch);
  }, [state])

  return <Provider value={{ state, dispatch }} children={children} />;
};
