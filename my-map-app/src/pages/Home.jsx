function Home() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-cream bg-mainbg bg-contain bg-left-bottom bg-no-repeat md:flex-row">
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

      <img
        src="/public/Satellite Vector.png"
        alt="satelite"
        className="absolute left-[15%] top-[20%] z-10 scale-50 brightness-75 md:left-[25%] md:top-[15%] md:scale-100"
      />
    </div>
  );
}

export default Home;
