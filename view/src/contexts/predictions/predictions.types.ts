export type Performance = {
  date: Date;
  oneDayPredictionsCall: number;
  oneDayPredictionsPut: number;
  oneDayPredictionsVectorCall: number;
  oneDayPredictionsVectorPut: number;
  twoDayPredictionsCall: number;
  twoDayPredictionsPut: number;
  twoDayPredictionsVectorCall: number;
  twoDayPredictionsVectorPut: number;
};

export type Prediction = {
  date: Date;
  at?: number;
  high?: number;
  low?: number;
  callOneDay: number;
  putOneDay: number;
  callTwoDay: number;
  putTwoDay: number;
  callOneDayVector: number;
  putOneDayVector: number;
  callTwoDayVector: number;
  putTwoDayVector: number
}

export enum AllLoadedStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inprogress',
  DONE = 'done'
}