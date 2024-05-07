import React from "react";

function MovieFilter({ movieFilter, setMovieFilter }) {
  const renderFilterOptions = () => {
    const ratings = ["All", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
    return (
      <select
        onChange={(e) => setMovieFilter(e.target.value)}
        value={movieFilter}
      >
        {ratings.map((rating) => (
          <option
            className="text-black"
            placeholder="filter rating..."
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

export default MovieFilter;
