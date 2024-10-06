import { useState, useEffect } from "react";

function About() {
  const [hovering, setHovering] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/public/animation/Property 1=Variant1.svg",
    "/public/animation/Property 1=Variant2.svg",
    "/public/animation/Property 1=Variant3.svg",
    "/public/animation/Property 1=Variant4.svg",
    "/public/animation/Property 1=Variant5.svg",
    "/public/animation/Property 1=Variant6.svg",
    "/public/animation/Property 1=Variant7.svg",
    "/public/animation/Property 1=Variant8.svg",
    "/public/animation/Property 1=Variant9.svg",
    "/public/animation/Property 1=Variant10.svg",
    "/public/animation/Property 1=Variant11.svg",
    "/public/animation/Property 1=Variant12.svg",
    "/public/animation/Property 1=Variant13.svg",
    "/public/animation/Property 1=Variant14.svg",
    "/public/animation/Property 1=Variant15.svg",
    "/public/animation/Property 1=Variant16.svg",
    "/public/animation/Property 1=Variant17.svg",
    "/public/animation/Property 1=Variant18.svg",
    "/public/animation/Property 1=Variant19.svg",
    "/public/animation/Property 1=Variant20.svg",
    "/public/animation/Property 1=Variant21.svg",
    "/public/animation/Property 1=Variant22.svg",
  ];

  useEffect(() => {
    let interval;
    if (hovering) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 200); // Change image every 200 milliseconds (adjust the timing as needed)
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [hovering]);

  return (
    <div
      className="grid grid-cols-2 bg-cream bg-aboutbg bg-contain bg-no-repeat px-48"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <img
        src={images[currentImageIndex]}
        alt="Earth Animation"
        className="scale-125 place-self-center"
      />

      <div>
        <h1 className="mt-24 text-center text-6xl font-semibold">About Us</h1>
        <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-lightblue p-10">
          <p>
            Mapping X was created for the "Community Mapping" Challenge for the
            NASA Space Apps 2024 Oshawa Event. Authors of this project are
            Jeremy Mark Tubongbanua, Jeska Maya Tubongbanua, and Jerry Shum.
          </p>
          <div>
            Figma Prototyping:
            <img
              src="https://i.imgur.com/xLHJ1nM.png"
              alt="figma prototyping"
              className="rounded-lg"
            />
          </div>
          <div>
            How It Works:
            <img
              src="https://i.imgur.com/EGqX8QF.png"
              alt="how it works"
              className="rounded-lg"
            />
          </div>
          <div>
            Technologies Used
            <img src="https://i.imgur.com/5ybQ913.png" alt="" />
          </div>
          <div>
            GIF Animation of some Elevation Terrain and SWOT Water Level STLs
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZnY2dXljaXFjeXlseGhuODdqdzBqM2tvcmFpaG03eTNndGw4MmM1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uA2GZlWViQhSv3UhGa/giphy.gif"
              alt="fun animation"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
