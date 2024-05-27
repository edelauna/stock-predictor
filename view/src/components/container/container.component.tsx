import React, { useContext } from "react";
import { Stats } from "../stats/stats.component";
import { store } from "../../contexts/predictions";

export const Container = () => {
  const {state} = useContext(store)
  const lastUpdatedAt = state.mainPrediction.date
  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            SPY
          </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Last Updated: {lastUpdatedAt.toLocaleString()}.</p>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 divide-y divide-dashed">
          <div>
            <Stats />
          </div>
        </div>
      </main>
    </div>
  );
};
