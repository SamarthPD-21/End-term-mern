import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-veblyssBackground min-h-screen my-10">
      <section className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl">
          <h1 className="font-playfair font-bold text-6xl md:text-8xl text-veblyssPrimary mb-6">
            404
          </h1>
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-veblyssText mb-6">
            Page Not Found
          </h2>
          <p className="font-opensans text-lg text-veblyssText mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist. It might have been moved,
            deleted, or you entered the wrong URL.
          </p>

          <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:gap-4">
            <Link
              href="/"
              className="inline-block bg-[#368581] text-veblyssText font-opensans font-bold text-lg px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 border-2 border-veblyssPrimary"
            >
              Go Home
            </Link>
            <Link
              href="/products"
              className="inline-block bg-[#368581] text-veblyssText font-opensans font-bold text-lg px-8 py-4 rounded-xl hover:bg-opacity-90 transition-all duration-300 border-2 border-veblyssPrimary"
            >
              View Products
            </Link>
          </div>

          <div className="mt-12">
            <p className="font-opensans text-veblyssText mb-4">
              Looking for our product categories?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products/leather"
                className="text-veblyssPrimary hover:underline"
              >
                Leather Products
              </Link>
              <Link
                href="/products/copper"
                className="text-veblyssPrimary hover:underline"
              >
                Copper Products
              </Link>
              <Link
                href="/products/imitation-jewelry"
                className="text-veblyssPrimary hover:underline"
              >
                Imitation Jewelry
              </Link>
              <Link
                href="/products/handicrafts"
                className="text-veblyssPrimary hover:underline"
              >
                Indian Handicrafts
              </Link>
              <Link
                href="/products/sustainable"
                className="text-veblyssPrimary hover:underline"
              >
                Sustainable Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
