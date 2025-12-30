import { motion } from "motion/react";
import { Heart } from "lucide-react";

export function Hero() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-b from-amber-50 via-yellow-50 to-white">
            {/* Bg batik overlay */}
            <div className="absolute inset-0 opacity-5"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B4513' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}>
                <Heart className="w-full h-full" />
            </div>

            {/* bg decoration */}
            <div className="absolute inset-20 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left 1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-800 rounded-full blur-3xl"></div>
            </div>

            {/* dekorasi ornamen sudut */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-10 border-l-10 border-amber-600 opacity-30"></div>
            <div className="absolute top-0 right-0 w-32 h-32 border-t-10 border-r-10 border-amber-600 opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-10 border-l-10 border-amber-600 opacity-30"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-10 border-r-10 border-amber-600 opacity-30"></div>

            <div className="relative z-10 text-center px-10">
                <motion.div
                    initial={{ opacity: 0 , y: 50}}
                    animate={{ opacity: 1 , y: 0}}
                    transition={{ duration: 0.8}}
                >
                    <div className="mb-8">
                        <svg className="w-24 h-24 mx-auto text-amber-600" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M50,20 Q40,10 30,20 Q20,30 30,40 L50,60 L70,40 Q80,30 70,20 Q60,10 50,20 Z" />
                        <circle cx="50" cy="50" r="3" fill="currentColor"/>
                        <circle cx="40" cy="45" r="2" fill="currentColor"/>
                        <circle cx="60" cy="45" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50}}
                    animate={{ opacity: 1, y:0}}
                    transition={{ duration: 0.8, delay: 0.2}}
                    className="mb-6"
                >
                    <p className="text-lg md:text-xl text-gray-600 mb-2">Assalamualaikum Wr. Wb</p>
                    <p className="text-xl md:text-xl text-amber-800">Mantenan Dalem</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9}}
                    animate={{ opacity: 1, scale:1}}
                    transition={{ duration: 0.8, delay: 0.4}}
                >
                    <h2 className="text-6xl md:text-8xl font-serif text-amber-700 mb-2"
                    style={{ fontFamily: "serif"}}
                    >
                        Pocong & Leak 
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0}}
                    animate={{ opacity:1}}
                    transition={{ duration: 0.8, delay: 0.6}}
                    className="mt-6"
                >
                    <div className="inline-block relative">
                        {/* dekorasi gharis */}
                        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex items-center justify-between">
                            <div className="w-20 h-px bg-linear-to-r from-transparent to-amber-600"></div>
                            <div className="w-20 h-px bg-linear-to-l from-transparent to-amber-600"></div>
                        </div>
                        <div className="relative bg-linear-to-r from-amber-100 to-yellow-100 border-2 border-amber-600 py-4 px-12 mx-20">
                        <p className="text-xl md:text-2xl text-amber-900">
                            15 Februari 2027
                        </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity:1, y: 20}}
                    animate={{ opacity:1, y:1}}
                    transition={{ duration: 0.8, delay: 0.8}}
                    className="mt-12"
                >
                    <a
                        href="#details"
                        className="inline-block px-8 py-3 bg-linear-to-r from-amber-600 to-yellow-700 text-white rounded-sm hover:from-amber-700 hover:to-yellow-800 transition-all shadow-lg border border-amber-800"
                    >
                        Buka Undangan
                    </a>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-amber-600 rounded-full flex justify-center">
                    <motion.div 
                        animate={{ 
                        y: [0, 12, 0] // Bergerak dari posisi 0 ke bawah 12px, lalu balik ke 0
                        }}
                        transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                        }}
                        className="w-1 h-3 bg-amber-700 rounded-full mt-2"
                    />
                </div>
            </motion.div>
        </div>
    )
}