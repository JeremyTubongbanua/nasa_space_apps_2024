import { Link } from "react-router-dom";

function Map() {
  return (
    <div className="grid grid-cols-2 gap-32 bg-cream px-48">
      <div>
        <h1 className="mt-24 text-center text-6xl font-semibold">Map</h1>
        <div className="mt-10 h-3/5 rounded-[80px] bg-lightblue p-10">
          Hello! And Welcome to Mapping X.
          <p className="mt-10">
            Mapping X is a fun and interactive tool that let's you generate 3D
            mesh .STL files from NASA Satellite Earthview data.
          </p>
          <p className="mt-10">Mapping X supports</p>
          <ol>
            <li>
              1. Digital Elevation Model (DEM) data (taken from the Landsat
              Sentinel-2 from the{" "}
              <a
                target="_blank"
                href="https://search.earthdata.nasa.gov/search/granules?p=C2617126679-POCLOUD!C2617126679-POCLOUD&pg[1][v]=t&pg[1][qt]=2024-09-01T00%3A00%3A00.000Z%2C2024-10-05T23%3A59%3A59.999Z&pg[1][gsk]=-start_date&pg[1][m]=download&pg[1][cd]=f&g=G3255426262-POCLOUD&q=C2617126679-POCLOUD&sb[0]=-84.50335%2C42.49193%2C-76.69638%2C46.67306&tl=1728136233!3!!&lat=44.685791015625&long=-85.10009765625&zoom=7"
                class="text-blue-500 underline"
              >
                OPERA Dynamic Surface Water Extent from Harmonized Landsat
                Sentinel-2 product (Version 1) dataset
              </a>
              )
            </li>
            <li>
              2. Surface Water and Ocean Topography (SWOT) data, taken from the
              SWOT satellite mission from the{" "}
              <a
                href="https://search.earthdata.nasa.gov/search/granules/collection-details?p=C2799438271-POCLOUD!C2799438271-POCLOUD&pg[1][v]=t&pg[1][qt]=2024-09-01T00%3A00%3A00.000Z%2C2024-09-20T23%3A59%3A59.999Z&pg[1][oo]=true&pg[1][gsk]=-start_date&pg[1][m]=download&pg[1][cd]=f&sb[0]=-84.93608%2C42.96613%2C-81.25238%2C46.12832&fpj=SWOT&tl=1728136233!3!!&lat=43.52323516192574&long=-84.80180669309243&zoom=6"
                target="_blank"
                className="underlined text-blue-500"
              >
                SWOT Level 2 Water Mask Raster Image Data Product, Version C
              </a>{" "}
              dataset
            </li>
          </ol>
          <p>Currently, since satellite data is VERY large in storage size, it was very hard to get a lot of images. So right now, we only support datasets that are in the South Ontario area, and we currenetly do not cover a whole large area, because we were limited by how much of that data we were able to hold on our server even when scaling the resolution down. </p>
          <br/>
          <p>
            You will have the option of overlaying the map with either DEM data (Digital Elevation Model) or SWOT data (Surface Water and Ocean Topography). You can also overlay both DEM and SWOT data.
            DEM Data overlay sample
            <img src="https://i.imgur.com/nLlCS8E.png" alt="SWOT" />
            SWOT Data overlay sample
            <img src="https://i.imgur.com/hTwP5hK.png" alt="DEM" />
          </p>
          <p>Here are some of the sample .STL files that you can create</p>
        </div>
      </div>
      <div className="mt-24 flex flex-col items-center gap-10">
        <div className="h-3/5 w-full bg-gray-300 p-20">
          <strong>Instructions</strong>
          <p>
            1. Click on the rectangle tool on the top left of your screen to
            select the Rectangle tool. <br></br>2. Click and drag to draw a rectangle on
            the map. <br></br>3. If you selected a region with either DEM data or SWOT
            data, then it will generate an .STL file for you. You may need to
            allow your browser to download the file.
            <img
              src="https://i.imgur.com/C4xnuXY.png"
              alt="Rectangle Tool Instructions"
            />
          </p>
          <p>
            Upon drawing a rectangle, this will generate a 3D mesh .STL file. An .STL may not always be geneated for maybe a couple reasons: the region you selected may not have data, or may only have data of one of the two (DEM or SWOT).
            <img
              src="https://i.imgur.com/o4Ou5yr.png"
            />
          </p>
        </div>

        <Link
          to={"/mapapp"}
          className="w-2/4 rounded-lg bg-orange-300 p-5 text-center text-2xl font-semibold uppercase"
        >
          GO TO MAP
        </Link>
      </div>
    </div>
  );
}

export default Map;
