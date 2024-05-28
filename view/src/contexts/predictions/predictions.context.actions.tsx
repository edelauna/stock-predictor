import type { AllLoadedStatus, Prediction } from "./predictions.types";

export enum ActionType {
  AddMain = "main/prediction/add",
  AllLoaded = "main/all-loaded",
  UpdateHistory = 'history/update',
  UpdateCursor = 'cursor/update',
  ResetHistory = 'history/reset',
  UseWordVectors = 'models/toggle'
}

type AddMainType = {
  type: ActionType.AddMain;
  payload: Prediction;
};

type AllLoadedType = {
  type: ActionType.AllLoaded;
  payload: AllLoadedStatus;
};

type UpdateHistoryType = {
  type: ActionType.UpdateHistory;
  payload: Prediction;
};

type UpdateCursorType = {
  type: ActionType.UpdateCursor;
  payload: Date;
};

type ResetHistoryType = {
  type: ActionType.ResetHistory;
};

type UseWordVectorsType = {
  type: ActionType.UseWordVectors;
};

export type Actions = AddMainType | AllLoadedType | UpdateHistoryType | ResetHistoryType | UpdateCursorType | UseWordVectorsType;

export const AddMain = (data: Prediction): AddMainType => ({
  type: ActionType.AddMain,
  payload: data,
});

export const AllLoaded = (value: AllLoadedStatus): AllLoadedType => ({
  type: ActionType.AllLoaded,
  payload: value,
});

export const UpdateHistory = (history: Prediction): UpdateHistoryType => ({
  type: ActionType.UpdateHistory,
  payload: history,
});

export const UpdateCursor = (cursor: Date): UpdateCursorType => ({
  type: ActionType.UpdateCursor,
  payload: cursor,
});

export const ResetHistory = (): ResetHistoryType => ({
  type: ActionType.ResetHistory
});

export const UseWordVectors = (): UseWordVectorsType => ({
  type: ActionType.UseWordVectors
});
