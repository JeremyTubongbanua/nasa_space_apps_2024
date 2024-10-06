import { useState, useEffect } from 'react';

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
      className="bg-cream bg-aboutbg grid grid-cols-2 bg-contain bg-no-repeat px-48"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <img
        src={images[currentImageIndex]}
        alt="Earth Animation"
        className="scale-125 place-self-center"
      />
      <img
        src="/public/Satellite Vector.png"
        alt="Satellite Vector"
        className="absolute bottom-10 left-10 rotate-90 scale-150"
      />
      <div>
        <h1 className="mt-24 text-center text-6xl font-semibold">About Us</h1>
        <div className="bg-lightblue mt-10 h-3/5 rounded-3xl p-10">
          description goes here
        </div>
      </div>
    </div>
  );
}

export default About;
