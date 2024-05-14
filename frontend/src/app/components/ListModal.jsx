export default function ListModal({ isOpen, close, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-4 rounded shadow-lg w-full max-w-md">
        {children}
        <button onClick={close} className="mt-4 text-red-500">
          Close
        </button>
      </div>
    </div>
  );
}
