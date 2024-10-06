import { useState, useEffect } from "react";

function Home() {
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
      }, 200); // Adjust the speed if needed
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, [hovering, images.length]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-clip bg-cream bg-mainbg bg-contain bg-left-bottom bg-no-repeat md:flex-row">
      {/* Blue Box */}
      <div className="z-10 w-[80%] rounded-[5vw] border-[3px] border-black bg-lightblue p-10 py-20 text-center md:w-[40%] md:py-40">
        <div className="flex flex-col justify-start gap-7">
          <h1 className="font-serif text-5xl font-extralight uppercase tracking-tight text-white md:text-8xl">
            mapping <span className="text-black">x</span>
          </h1>
          <h2 className="font-sans text-2xl font-normal md:text-4xl">
            Where maps meet innovation
          </h2>
        </div>
      </div>

      {/* Cloud 1 */}
      <img
        src="/public/Cloud Vector.png"
        alt="cloud"
        className="absolute bottom-[10%] right-[10%] z-20 scale-50 brightness-95 md:right-[25%] md:scale-125"
      />

      {/* Cloud 2 */}
      <img
        src="/public/Cloud Vector.2.png"
        alt="cloud2"
        className="absolute left-[15%] top-[20%] z-0 scale-50 brightness-75 md:left-[23%] md:top-[15%] md:scale-100"
      />

      {/* Replace satellite with the animation */}
      <img
        src={images[currentImageIndex]}
        alt="animated satellite"
        className="absolute right-0 top-0 z-10 scale-50 brightness-75 md:-right-[20%] md:top-[10%] md:scale-100"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      />
    </div>
  );
}

export default Home;
