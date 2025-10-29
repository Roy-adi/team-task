import React from 'react'

const LoadingCards  = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body space-y-4 animate-pulse">
            <div className="h-6 bg-base-300 rounded w-3/4"></div>
            <div className="h-4 bg-base-300 rounded w-full"></div>
            <div className="h-4 bg-base-300 rounded w-5/6"></div>
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-base-300 rounded w-full"></div>
              <div className="h-3 bg-base-300 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingCards 
