import { FaArrowCircleRight } from "react-icons/fa";

export default function InputField({
  handleQuerySubmit,
  handleInputChange,
  input,
  placeholder,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the form from submitting if it's inside a form
      performSearch();
    }
  };

  const performSearch = () => {
    console.log("Performing search for:", input);
    handleQuerySubmit();
  };
  return (
    <div
      style={{
        border: "1px solid grey",
        backdropFilter: "blur(20px)",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
      className="h-14 flex justify-center items-center rounded-full z-10"
    >
      <input
        className="h-14 bg-transparent w-full md:w-1/3 rounded-full text-lg text-center text-slate-50 md:mr-3 border-none"
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
      />
      <button
        className="flex justify-center items-center border-none bg-transparent"
        onClick={handleQuerySubmit}
        disabled={!input}
      >
        <FaArrowCircleRight
          className={`h-8 w-8 mr-5    ${
            input
              ? " hover:text-slate-300 text-slate-100 hover:cursor-pointer"
              : " text-slate-400"
          }  rounded-full   `}
        ></FaArrowCircleRight>
      </button>
    </div>
  );
}
