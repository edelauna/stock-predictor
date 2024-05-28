import React, { useContext, useState } from "react";
import { store } from "../../contexts/predictions";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker"; 
import { useStoreSideEffect } from "../../contexts/predictions/hooks/history.hook";
import { ResetHistory, UpdateCursor } from "../../contexts/predictions/predictions.context.actions";
import { AllLoadedStatus, Prediction } from "../../contexts/predictions/predictions.types";

enum ActualKey {
  HIGH = 'high',
  LOW = 'low'
}

export const Historic = () => {
  const { state, dispatch } = useContext(store)
  const [startDate, setStartDate] = useState<Date|null>(null); 
  const [dateValue, setDateValue] = useState<DateValueType>(null); 
  const { useWordVectors } = state
  const {loading} = useStoreSideEffect(state, dispatch, startDate, 2)
  
  const handleValueChange = (newValue: DateValueType) => {
    const newDate = new Date(newValue?.startDate!)
    setStartDate(newDate || null);
    setDateValue(newValue)
    dispatch(ResetHistory())
    dispatch(UpdateCursor(newDate))
  }
  return (
    <div className="m-2 space-y-2">
      <div
        className="group flex flex-col gap-2 rounded-lg bg-black p-5 text-white"
        tabIndex={1}
      >
        <div className="flex cursor-pointer items-center justify-between">
          <span> View Previous Predictions Since:</span>
        </div>
        <Datepicker 
          asSingle={true} 
          useRange={false}
          value={dateValue} 
          onChange={handleValueChange}
          disabled={(state.allLoaded!==AllLoadedStatus.DONE) || loading} 
        /> 
        <div className="flex justify-center mx-auto mt-4">
          <table className="table-auto min-w-full shadow-md rounded-xl">
            <thead>
              <tr className="bg-blue-gray-100 text-gray-200">
                <th>Date</th>
                <th>T+1 High Predicted</th>
                <th>T+1 High Actual</th>
                <th>T+1 Low Predicted</th>
                <th>T+1 Low Actual</th>
                <th>T+2 High Predicted</th>
                <th>T+2 High Actual</th>
                <th>T+2 Low Predicted</th>
                <th>T+2 Low Actual</th>
              </tr>
            </thead>
            <tbody>
              {state.history.map((h, i, arr) =>(
                <tr key={i}>
                  <td className="border border-sky-500 py-1 px-2">{h.date.toLocaleDateString()}</td>
                  <td className="border border-sky-500 py-1 px-4">{useWordVectors ? getPredictedNumber(h.callOneDayVector, h.at!) : getPredictedNumber(h.callOneDay, h.at!)}</td>
                  <td className="border border-sky-500 py-1 px-4">{getActualNumber(i+1, arr, ActualKey.HIGH)}</td>
                  <td className="border border-sky-500 py-1 px-4">{useWordVectors ? getPredictedNumber(h.putOneDayVector, h.at!) : getPredictedNumber(h.putOneDay, h.at!)}</td>
                  <td className="border border-sky-500 py-1 px-4">{getActualNumber(i+1, arr, ActualKey.LOW)}</td>
                  <td className="border border-sky-500 py-1 px-4">{useWordVectors ? getPredictedNumber(h.callTwoDayVector, h.at!) : getPredictedNumber(h.callTwoDay, h.at!)}</td>
                  <td className="border border-sky-500 py-1 px-4">{getActualNumber(i+2, arr, ActualKey.HIGH)}</td>
                  <td className="border border-sky-500 py-1 px-4">{useWordVectors ? getPredictedNumber(h.putTwoDayVector, h.at!) : getPredictedNumber(h.putTwoDay, h.at!)}</td>
                  <td className="border border-sky-500 py-1 px-4">{getActualNumber(i+2, arr, ActualKey.LOW)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  </div>
  );
};

const getPredictedNumber = (pred:number, at: number) => {
  // at will exist for history predictions, I was lazy and reused the type
  const value = at + pred
  const newValue = Math.round((value + Number.EPSILON) * 100) / 100
  return newValue
}

const getActualNumber = (i: number, arr: Prediction[], key: ActualKey) => {
  if(i >= arr.length)
    return ''
  return arr[i][key]
}