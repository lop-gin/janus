import Link from 'next/link';

// Simple SVG Icon Components (can be expanded or replaced later)
const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25v-4.073M15.75 9.75h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15.065-7.023L3.375 3.375m17.25 17.25-1.125-1.125M12 3v1.5m0 15V21m-6.975-15.065L3.375 8.625m17.25 3.375L20.625 12m-1.125 6.375 1.125 1.125M3.375 15.375l1.125-1.125m12-1.5c-3.036 0-5.5 2.464-5.5 5.5s2.464 5.5 5.5 5.5 5.5-2.464 5.5-5.5-2.464-5.5-5.5-5.5Zm0 0V12m0 6.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
  </svg>
);


export default function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="py-5 px-4 md:px-8 bg-gray-800 shadow-lg animate-slideInDown">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" legacyBehavior>
            <a className="text-3xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
              Recordserp
            </a>
          </Link>
          <nav className="space-x-4">
            <Link href="/signin" legacyBehavior>
              <a className="text-gray-300 hover:text-orange-400 transition-colors px-4 py-2 rounded-md text-sm font-medium">
                Sign In
              </a>
            </Link>
            <Link href="/signup" legacyBehavior>
              <a className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-300 ease-in-out transform hover:scale-105">
                Sign Up
              </a>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-24 md:py-40 text-center bg-gradient-to-b from-gray-800 via-gray-900 to-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 animate-fadeIn animation-delay-200" style={{ animationFillMode: 'backwards' }}>
              Streamline Your Manufacturing & Distribution
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-slideInUp animation-delay-400" style={{ animationFillMode: 'backwards' }}>
              Recordserp is the modern, intuitive ERP designed to optimize your operations, manage inventory seamlessly, and empower your growing business.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-6 animate-slideInUp animation-delay-400" style={{ animationFillMode: 'backwards' }}>
              <Link href="/signup" legacyBehavior>
                <a className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto">
                  Get Started Free
                </a>
              </Link>
              <Link href="/signin" legacyBehavior>
                <a className="inline-block bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-4 px-10 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl w-full md:w-auto">
                  Sign In to Your Account
                </a>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gray-900">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-16 text-gray-100 animate-fadeIn">Why Recordserp?</h3>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {/* Feature 1 */}
              <div className="p-8 bg-gray-800 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-out animate-slideInUp" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
                <BriefcaseIcon className="h-16 w-16 mx-auto mb-6 text-orange-500" />
                <h4 className="text-2xl font-semibold mb-3 text-gray-100">Integrated Inventory</h4>
                <p className="text-gray-400 leading-relaxed">Real-time tracking and management of stock across all your warehouses and production lines.</p>
              </div>
              {/* Feature 2 */}
              <div className="p-8 bg-gray-800 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-out animate-slideInUp" style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
                 <ChartBarIcon className="h-16 w-16 mx-auto mb-6 text-orange-500" />
                <h4 className="text-2xl font-semibold mb-3 text-gray-100">Seamless Order Processing</h4>
                <p className="text-gray-400 leading-relaxed">Effortlessly manage sales, purchases, and customer relationships from a unified dashboard.</p>
              </div>
              {/* Feature 3 */}
              <div className="p-8 bg-gray-800 rounded-xl shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-out animate-slideInUp" style={{ animationDelay: '1s', animationFillMode: 'backwards' }}>
                 <CogIcon className="h-16 w-16 mx-auto mb-6 text-orange-500" />
                <h4 className="text-2xl font-semibold mb-3 text-gray-100">User-Friendly Interface</h4>
                <p className="text-gray-400 leading-relaxed">Intuitive and modern design that your team can adopt quickly with minimal training.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center bg-gray-800 border-t border-gray-700">
        <p className="text-gray-400 text-sm">&copy; {currentYear} Recordserp. All rights reserved.</p>
      </footer>
    </div>
  );
}
