import type { AllLoadedStatus, Prediction } from "./predictions.types";

export enum ActionType {
  AddMain = "main/prediction/add",
  AllLoaded = "main/all-loaded",
}

type AddMainType = {
  type: ActionType.AddMain;
  payload: Prediction;
};

type AllLoadedType = {
  type: ActionType.AllLoaded;
  payload: AllLoadedStatus;
};

export type Actions = AddMainType | AllLoadedType;

export const AddMain = (data: Prediction): AddMainType => ({
  type: ActionType.AddMain,
  payload: data,
});

export const AllLoaded = (value: AllLoadedStatus): AllLoadedType => ({
  type: ActionType.AllLoaded,
  payload: value,
});
