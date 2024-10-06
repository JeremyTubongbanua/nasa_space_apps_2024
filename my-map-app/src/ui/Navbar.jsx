import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-vistablue flex h-full w-full items-center justify-between px-10 py-2">
      <ul className="flex gap-10">
        <li>
          <Link to={"/"} className="text-2xl font-light uppercase">
            Home
          </Link>
        </li>
        <li>
          <Link to={"/map"} className="text-2xl font-light uppercase">
            Map
          </Link>
        </li>
        <li>
          <Link to={"/about"} className="text-2xl font-light uppercase">
            About Us
          </Link>
        </li>
      </ul>
      <img src="/mapxlogo.png" alt="mappingxlogo" className="h-14" />
    </nav>
  );
}

export default Navbar;
