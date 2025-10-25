import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0f766e] text-white py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-white/20">
          <div className="space-y-3">
            <div className="text-2xl font-bold">SPD Global</div>
            <p className="text-sm text-white/90">Curated sustainable goods, handcrafted with care. Small business friendly and community driven.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Quick links</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/products" className="hover:underline">Products</Link></li>
              <li><Link href="/about" className="hover:underline">About</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <p className="text-sm">support@spdglobal.example</p>
            <p className="text-sm">+91 90000 00000</p>
            <div className="flex items-center gap-3 mt-3">
              <a aria-label="Instagram" href="https://instagram.com/spdglobal" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white">
                  <rect x="3" y="3" width="18" height="18" rx="4" ry="4" strokeWidth="1.5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" strokeWidth="1.5" />
                  <path d="M17.5 6.5h.01" strokeWidth="1.5" />
                </svg>
              </a>
              <a aria-label="LinkedIn" href="https://linkedin.com/company/spd-global" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-14h4v2" strokeWidth="1.5" />
                  <rect x="2" y="9" width="4" height="11" rx="1" ry="1" strokeWidth="1.5" />
                </svg>
              </a>
              <a aria-label="Email" href="mailto:support@spdglobal.example" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-white">
                  <path d="M3 8l9 6 9-6" strokeWidth="1.5" />
                  <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8" strokeWidth="1.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-sm text-white/80">
          © {new Date().getFullYear()} SPD Global Pvt Ltd — All rights reserved.
        </div>
      </div>
    </footer>
  )
}
