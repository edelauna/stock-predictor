import React, { useContext } from "react";
import { Stats } from "../stats/stats.component";
import { store } from "../../contexts/predictions";
import { Historic } from "../stats/historic.component";

export const Container = () => {
  const {state} = useContext(store)
  const lastUpdatedAt = state.mainPrediction.date
  return (
    <div className="min-h-full">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="flex text-3xl font-bold tracking-tight text-gray-900">
            <a href="https://www.wealthsimple.com/en-ca/quote/nyse/spy" target="_blank" rel="noopener noreferrer" className="hover:underline">SPY</a>
            <svg className="h-6 w-6 text-gray-900"  width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"/>  
              <path d="M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5" />  
              <line x1="10" y1="14" x2="20" y2="4" />  
              <polyline points="15 4 20 4 20 9" />
            </svg>
          </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Last Updated: {lastUpdatedAt.toLocaleString()}.</p>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8 divide-y divide-dashed">
          <div>
            <Stats />
          </div>
          <div>
            <Historic />
          </div>
        </div>
      </main>
    </div>
  );
};
