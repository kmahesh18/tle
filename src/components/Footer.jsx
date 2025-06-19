import { Code, Linkedin, Twitter, Mail, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white/90 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 py-6 w-full backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              Built with ❤️ by <span className="font-bold">Mahesh Kumar</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              © {new Date().getFullYear()} TLE Manager • Track, Learn, Excel
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            <a 
              href="https://github.com/kmahesh18" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="GitHub"
              title="GitHub"
            >
              <Code className="w-4 h-4" />
            </a>
            <a 
              href="https://www.linkedin.com/in/mahesh-kumar-0a2b47290/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="https://x.com/xnor404" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="X (Twitter)"
              title="X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href="mailto:maheshkolli888@gmail.com" 
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Email"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a 
              href="tel:+919346968655" 
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Phone"
              title="Phone"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
