export default function ChooseStreaming() {
  return (
    <main className="py-10 px-5 h-screen w-screen flex flex-col items-center">
      <div>
        <h1 className="text-3xl font-bold">Streaming services</h1>
        <p className="mt-6 text-sm">
          Choose which streaming services you are going to use. This can be
          changed later in your profile
        </p>
      </div>
      <div className="container mt-12 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          <div className="square">
            <div className="square-content">Netflix</div>
          </div>
          <div className="square">
            <div className="square-content">HBO max</div>
          </div>
          <div className="square">
            <div className="square-content">Viaplay</div>
          </div>
          <div className="square">
            <div className="square-content">Amazon Prime</div>
          </div>
          <div className="square">
            <div className="square-content">Disney+</div>
          </div>
          <div className="square">
            <div className="square-content">Hulu</div>
          </div>
          <div className="square">
            <div className="square-content">Apple TV+</div>
          </div>
          <div className="square">
            <div className="square-content">Paramount</div>
          </div>
          <div className="square">
            <div className="square-content">Mubi</div>
          </div>
        </div>
      </div>
      <button className="streaming-btn w-56 mt-8 rounded-3xl">
        Next
      </button>
    </main>
  );
}
