import { Link } from "react-router-dom";

function Map() {
  return (
    <div className="bg-cream grid grid-cols-2 gap-32 px-48">
      <div>
        <h1 className="mt-24 text-center text-6xl font-semibold">Map</h1>
        <div className="bg-lightblue mt-10 h-3/5 rounded-[80px] p-10">
          description goes here
        </div>
      </div>
      <div className="mt-24 flex flex-col items-center gap-10">
        <div className="h-3/5 w-full bg-gray-300 p-20 text-center">map</div>

        <Link
          to={"/map2"}
          className="w-2/4 rounded-lg bg-orange-300 p-5 text-center text-2xl font-semibold uppercase"
        >
          Go yessir
        </Link>
      </div>
    </div>
  );
}

export default Map;
