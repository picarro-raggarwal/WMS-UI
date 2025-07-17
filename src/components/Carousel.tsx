import React, { useEffect, useState } from "react";

interface Slide {
  headline: string;
  subtext: string;
}

interface CarouselProps {
  slides: Slide[];
  interval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ slides, interval = 6000 }) => {
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Handle auto-advance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDirection("right");
      setSlide((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearTimeout(timer);
  }, [slide, slides.length, interval]);

  // Track direction for manual navigation
  const goToSlide = (idx: number) => {
    if (idx === slide) return;
    setDirection(
      idx > slide || (slide === slides.length - 1 && idx === 0)
        ? "right"
        : "left"
    );
    setSlide(idx);
  };

  return (
    <>
      <div className="relative flex flex-col justify-center items-center w-full min-h-[60px] overflow-hidden">
        {slides.map((s, idx) => {
          // Determine animation classes
          const base =
            "absolute left-0 right-0 transition-all duration-600 ease-in-out ";
          const visible = "opacity-100 z-10 ";
          const hidden = "opacity-0 pointer-events-none z-0 ";
          const slideIn =
            direction === "right" ? "translate-x-0" : "translate-x-0";
          const slideOutLeft = "-translate-x-full";
          const slideOutRight = "translate-x-full";

          // Only render current, previous, and next for performance
          if (idx === slide) {
            return (
              <div
                key={idx}
                className={
                  base +
                  visible +
                  (direction === "right"
                    ? "translate-x-0 animate-slide-in-right"
                    : "translate-x-0 animate-slide-in-left")
                }
                aria-hidden={false}
              >
                <p className="mb-1 font-semibold text-neutral-700 text-xl text-center">
                  {s.headline}
                </p>
                <p className="mx-auto max-w-xl text-neutral-700 text-base text-center">
                  {s.subtext}
                </p>
              </div>
            );
          } else if (
            (direction === "right" &&
              idx === (slide - 1 + slides.length) % slides.length) ||
            (direction === "left" && idx === (slide + 1) % slides.length)
          ) {
            // Outgoing slide
            return (
              <div
                key={idx}
                className={
                  base +
                  hidden +
                  (direction === "right"
                    ? slideOutLeft + " animate-slide-out-left"
                    : slideOutRight + " animate-slide-out-right")
                }
                aria-hidden={true}
              >
                <p className="mb-1 font-semibold text-neutral-700 text-xl text-center">
                  {s.headline}
                </p>
                <p className="mx-auto max-w-xl text-neutral-700 text-base text-center">
                  {s.subtext}
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
      {/* Dots for carousel */}
      <div className="flex justify-center gap-2 mt-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`rounded-full w-2 h-2 transition-all duration-200 
              ${slide === idx ? "bg-white/80 scale-125" : "bg-white/40"}`}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={slide === idx}
            onClick={() => goToSlide(idx)}
          />
        ))}
      </div>
      {/* Tailwind custom animations (add to global CSS if not present) */}
      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-out-left {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
        @keyframes slide-out-right {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s both;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s both;
        }
        .animate-slide-out-left {
          animation: slide-out-left 0.5s both;
        }
        .animate-slide-out-right {
          animation: slide-out-right 0.5s both;
        }
      `}</style>
    </>
  );
};

export default Carousel;
