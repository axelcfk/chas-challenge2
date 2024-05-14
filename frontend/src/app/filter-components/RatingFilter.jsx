import React from "react";

function RatingFilter({ ratingFilter, setRatingFilter }) {
  const renderFilterOptions = () => {
    const ratings = ["All", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
    return (
      <select
        className="text-gray-500 rounded-s bg-deep-purple px-0 py-1.5 hover:bg-lighter-purple cursor-pointer border border-solid border-gray-500 focus:border-gray-500 focus:outline-none"
        onChange={(e) => setRatingFilter(e.target.value)}
        value={ratingFilter}
      >
        {ratings.map((rating) => (
          <option
            className="text-white hover:text-white cursor-pointer"
            placeholder=""
            key={rating}
            value={rating}
          >
            {rating === "All" ? (
              "Ratings"
            ) : (
              `Above ${rating}`
            )}
          </option>
        ))}
      </select>
    );
  };

  return <div>{renderFilterOptions()}</div>;
}

export default RatingFilter;
