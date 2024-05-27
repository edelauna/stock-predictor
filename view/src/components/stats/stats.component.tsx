import React, { useContext, useState } from "react";
import { store } from "../../contexts/predictions";
import { Button } from "../button/button.component";

const getColor = (value: number) =>  (value >= 0) ? 'text-green-500' : 'text-red-500'

const getNumber = (value: number) => {
  const newValue = Math.round((value + Number.EPSILON) * 100) / 100
  return (value >= 0) ? `+${newValue}`: newValue}

const getExpectedError = (value: number) => {
  return Math.round((Math.pow(value, 0.5) + Number.EPSILON) * 100) / 100
}

export const Stats = () => {
  const { state } = useContext(store)
  const { mainPrediction: mp, performance: perf } = state
  const [wordVectors, setWordVectors] = useState(false);
  const stats = !wordVectors ? [
    { id: 1, name: `(±${getExpectedError(perf.oneDayPredictionsCall)}) Predicted High for T+1 business days`, value: getNumber(mp.callOneDay), color: getColor(mp.callOneDay) },
    { id: 2, name: `(±${getExpectedError(perf.oneDayPredictionsPut)}) Predicted Low for T+1 business days`, value: getNumber(mp.putOneDay), color: getColor(mp.putOneDay) },
    { id: 3, name: `(±${getExpectedError(perf.twoDayPredictionsCall)}) Predicted High for T+2 business days`, value: getNumber(mp.callTwoDay), color: getColor(mp.callTwoDay) },
    { id: 4, name: `(±${getExpectedError(perf.twoDayPredictionsPut)}) Predicted Low for T+2 business days`, value: getNumber(mp.putTwoDay), color: getColor(mp.putTwoDay) },
  ] : [
    { id: 1, name: `(±${getExpectedError(perf.oneDayPredictionsVectorCall)}) Predicted High for T+1 business days`, value: getNumber(mp.callOneDayVector), color: getColor(mp.callOneDayVector) },
    { id: 2, name: `(±${getExpectedError(perf.oneDayPredictionsVectorPut)}) Predicted Low for T+1 business days`, value: getNumber(mp.putOneDayVector), color: getColor(mp.putOneDayVector) },
    { id: 3, name: `(±${getExpectedError(perf.twoDayPredictionsVectorCall)}) Predicted High for T+2 business days`, value: getNumber(mp.callTwoDayVector), color: getColor(mp.callTwoDayVector) },
    { id: 4, name: `(±${getExpectedError(perf.twoDayPredictionsVectorPut)}) Predicted Low for T+2 business days`, value: getNumber(mp.putTwoDayVector), color: getColor(mp.putTwoDayVector) },
  ]
  return (
    <div className="bg-white py-6 sm:py-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
        {wordVectors ? 'Word Vector Model' : 'Embeddings Model'}
      </h1>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4">
              <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
              <dd className={"order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl " + stat.color}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex justify-center mx-auto mt-4">
        <Button onClick={() => setWordVectors(!wordVectors)}>{wordVectors ? 'Use Embedding Model': 'Use Word Vector Model'}</Button>
      </div>
    </div>
  );
};
