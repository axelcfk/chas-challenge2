import React from "react";

function RatingFilter({ ratingFilter, setRatingFilter }) {
  const renderFilterOptions = () => {
    const ratings = ["All", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
    return (
      <select
        className="text-black"
        onChange={(e) => setRatingFilter(e.target.value)}
        value={ratingFilter}
      >
        {ratings.map((rating) => (
          <option
            className="text-black"
            placeholder=""
            key={rating}
            value={rating}
          >
            {rating === "All" ? "All Ratings" : `Above ${rating}`}
          </option>
        ))}
      </select>
    );
  };

  return <div>{renderFilterOptions()}</div>;
}

export default RatingFilter;
