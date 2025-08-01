import Carousel from "@/components/Carousel";

const carouselSlides = [
  {
    headline: "Real-Time EtO Monitoring with Unmatched Precision",
    subtext:
      "Get instant, accurate readings for workplace safety and compliance."
  },
  {
    headline: "Advanced CRDS Technology for Regulatory Compliance",
    subtext: "Meet and exceed industry standards with cutting-edge measurement."
  },
  {
    headline: "Zero Cross-Port Contamination. Maximum Confidence.",
    subtext: "Trust your data with our unique, contamination-free design."
  },
  {
    headline: "Reliable Indoor Air Quality Data - Anytime, Anywhere",
    subtext:
      "Access and monitor your workplace air quality from any device, any location."
  }
];

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex md:flex-row flex-col bg-neutral-900 min-h-screen">
      {/* Left Panel */}
      <div className="flex flex-col justify-center items-center bg-[#b7d2c6] px-6 md:px-0 py-12 md:py-0 w-full md:w-1/2 gap-4">
        {/* Illustration or Logo */}
        <div className="mb-8 text-center flex gap-2 flex-col">
          <img
            src="/picarro_logo.svg"
            alt="Picarro Logo"
            className="mx-auto w-96 max-w-full"
          />
        </div>

        <div className="font-semibold text-xl">
          Workplace Monitoring Solution (WMS)
        </div>

        <Carousel slides={carouselSlides} />
      </div>
      {/* Right Panel */}
      <div className="flex flex-col justify-center items-center bg-white px-4 md:px-0 py-12 md:py-0 w-full md:w-1/2">
        <div className="flex flex-col justify-center items-center gap-8 mx-auto w-full max-w-md">
          {children}
          <p className="mx-auto mt-4 text-neutral-600 text-sm text-center">
            Authorized users only. Copyright &copy; 2025 Picarro, Inc. All
            rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
