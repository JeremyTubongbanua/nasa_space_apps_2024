function About() {
  return (
    <div className="bg-cream bg-aboutbg grid grid-cols-2 bg-contain bg-no-repeat px-48">
      <img
        src="/public/Earth Vector.svg"
        alt=""
        className="scale-125 place-self-center"
      />
      <img
        src="/public/Satellite Vector.png"
        alt=""
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
