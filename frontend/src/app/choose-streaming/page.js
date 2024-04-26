export default function ChooseStreaming() {
  return (
    <main className="py-10 px-5 h-screen w-screen flex flex-col">
      <div>
        <h1 className="text-3xl font-bold">Streaming services</h1>
        <p className="mt-6 text-sm">
          Choose which streaming services you are going to use. This can be
          changed later in your profile
        </p>
      </div>
      <div className="streaming-container grid grid-cols-3 gap-4 mt-6">
        <p className="streaming-card">Netflix</p>
        <p className="streaming-card">HBO max</p>
        <p className="streaming-card">Viaplay</p>
        <p className="streaming-card">Amazon Prime</p>
        <p className="streaming-card">Disney+</p>
        <p className="streaming-card">Hulu</p>
        <p className="streaming-card">Apple TV+</p>
        <p className="streaming-card">Paramount</p>
        <p className="streaming-card">Mubi</p>
      </div>
      <button className="streaming-btn border-2 w-52 mt-8 rounded-2xl">
        Next
      </button>
    </main>
  );
}
