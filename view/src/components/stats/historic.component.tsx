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
  const { useWordVectors, history } = state
  const {loading} = useStoreSideEffect(state, dispatch, startDate, 5)
  
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
          inputClassName={"relative transition-all duration-300 py-2.5 pl-4 pr-14 w-full border-gray-300 dark:bg-slate-800 dark:text-white/80 dark:border-slate-600 rounded-lg tracking-wide font-light text-base placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-blue-500/20"}
        /> 
        <div className="overflow-auto">
          <table className="min-w-full divide-y shadow-md rounded-xl">
            <thead className="sticky top-0">
              <tr className="text-gray-200">
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase sticky bg-black left-0">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+1 High Predicted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+1 High Actual</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+1 Low Predicted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+1 Low Actual</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+2 High Predicted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+2 High Actual</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+2 Low Predicted</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">T+2 Low Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.slice(0, 3).map((h, i) =>(
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 border border-sky-500 bg-black">{h.date.toLocaleDateString()}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{useWordVectors ? getPredictedNumber(h.callOneDayVector, h.at!) : getPredictedNumber(h.callOneDay, h.at!)}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{getActualNumber(i+1, history, ActualKey.HIGH)}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{useWordVectors ? getPredictedNumber(h.putOneDayVector, h.at!) : getPredictedNumber(h.putOneDay, h.at!)}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{getActualNumber(i+1, history, ActualKey.LOW)}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{useWordVectors ? getPredictedNumber(h.callTwoDayVector, h.at!) : getPredictedNumber(h.callTwoDay, h.at!)}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{getActualNumber(i+2, history, ActualKey.HIGH)}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{useWordVectors ? getPredictedNumber(h.putTwoDayVector, h.at!) : getPredictedNumber(h.putTwoDay, h.at!)}</td>
                  <td className="border border-sky-500 px-6 py-4 whitespace-nowrap">{getActualNumber(i+2, history, ActualKey.LOW)}</td>
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