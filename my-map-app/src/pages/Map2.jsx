function Map2() {
  return (
    <div className="bg-cream px-48">
      <h1 className="mt-24 text-6xl font-semibold">Map Analysis</h1>
      <div className="mt-12 grid grid-cols-3 gap-12">
        <div className="flex flex-col gap-10 rounded-lg bg-lightblue p-10">
          {/* convert the div into component and insert component here */}
          <div className="rounded-lg bg-orange-300 p-10">something here</div>
          <div className="rounded-lg bg-orange-300 p-10">something here</div>
          <div className="rounded-lg bg-orange-300 p-10">something here</div>
          <div className="rounded-lg bg-orange-300 p-10">something here</div>
        </div>
        <div className="col-span-2 rounded-lg bg-gray-300">something here </div>
      </div>
    </div>
  );
}

export default Map2;
