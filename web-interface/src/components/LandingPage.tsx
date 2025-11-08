import { motion } from 'framer-motion';
import { FiMenu } from 'react-icons/fi';
import { BiGlobe } from 'react-icons/bi';
import { IoChatbubbleOutline } from 'react-icons/io5';

interface LandingPageProps {
  onOpenChat: () => void;
}

export function LandingPage({ onOpenChat }: LandingPageProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      <header className="absolute top-0 left-0 right-0 z-20 px-8 py-4 bg-white border-b border-black/10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <BiGlobe className="w-5 h-5 text-[#180079]" strokeWidth={0.5} />
            
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/ff81125f97f3c967c9b0694847e86c98ebf66cb5?width=482" 
              alt="ULBS Logo" 
              className="h-[46px] w-auto"
            />
          </div>

          <nav className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-bold text-[#180079] hover:opacity-70 transition-opacity">
              Programe de studii
            </a>
            <a href="#" className="text-[10px] font-bold text-[#180079] hover:opacity-70 transition-opacity">
              StudentHub
            </a>
            <a href="#" className="text-[10px] font-bold text-[#180079] hover:opacity-70 transition-opacity">
              Cercetare
            </a>
            <a href="#" className="text-[10px] font-bold text-[#180079] hover:opacity-70 transition-opacity">
              Admission 2026
            </a>
            <button className="text-[#180079] hover:opacity-70 transition-opacity">
              <FiMenu className="w-3 h-3" strokeWidth={3} />
            </button>
          </nav>
        </div>
      </header>

      <div className="absolute top-[74px] left-0 right-0 bottom-0">
        <div className="relative w-full h-full">
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/1b7c4bb97f1893f78aa77bf91c5edc1c596237ee?width=1834"
            alt="University Cover"
            className="w-full h-full object-cover border border-black"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <p className="text-[14px] font-extrabold text-white mb-4 tracking-wide">
                #StudiazaInSibiu #NoiSuntemULBS
              </p>

              <div className="flex items-center justify-center gap-2 mb-8">
                <h1 className="text-[48px] font-bold text-white leading-none">
                  Welcome to
                </h1>
                <div className="relative">
                  <div 
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'linear-gradient(90deg, #FF0307 0%, #040B9B 100%)'
                    }}
                  />
                  <h2 
                    className="relative text-[40px] font-bold text-white leading-none px-8 py-2"
                  >
                    #EconomiceULBS
                  </h2>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenChat}
            className="absolute bottom-12 right-12 w-[58px] h-[54px] flex items-center justify-center bg-[#180079] rounded-full shadow-2xl hover:shadow-[#180079]/50 transition-all duration-300 border-2 border-[#180079]"
            aria-label="Open chat"
          >
            <IoChatbubbleOutline className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
