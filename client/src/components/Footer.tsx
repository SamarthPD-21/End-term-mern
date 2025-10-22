export default function Footer() {
  return (
    <footer className="bg-teal-700 text-white py-8">
      <div className="mx-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-end items-start md:items-center border-b border-white pb-6 mb-6">
          <div className="text-left px-10">
            <h2 className="text-lg font-bold mb-2">VeBlyss Global Pvt Ltd</h2>
            <ul className="space-y-1 text-sm">
              <li>Address</li>
              <li>Email</li>
              <li>Phone</li>
              <li>LinkedIn</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-left px-10">
          <p className="text-white text-sm">Domain details</p>
        </div>
      </div>
    </footer>
  );
}
