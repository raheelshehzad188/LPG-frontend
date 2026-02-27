import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bed,
  Bath,
  Square,
  Compass,
  ShieldCheck,
  Zap,
  Flame,
  Trees,
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { getListingById } from '../data/mockListings'
import ROICalculator from './ROICalculator'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const fadeTransition = { duration: 0.4 }

const DETAIL_FALLBACK = {
  beds: 4,
  baths: 4,
  marlas: 20,
  facing: 'North',
  rentalYield: '6.2%',
  whyThisProperty: ['Strong appreciation potential.', 'Good rental demand.', 'Verified documentation.'],
  legalStatus: 'LDA Approved',
  gallery: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'],
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [sticky, setSticky] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  const fromState = state?.listing
  const fromMock = getListingById(id)
  const property = fromState
    ? {
        ...DETAIL_FALLBACK,
        ...fromState,
        gallery:
          Array.isArray(fromState.gallery) && fromState.gallery.length
            ? fromState.gallery
            : Array.isArray(fromState.images) && fromState.images.length
              ? [fromState.cover_photo || fromState.images[0], ...fromState.images]
              : fromState.cover_photo || fromState.image
                ? [fromState.cover_photo || fromState.image]
                : DETAIL_FALLBACK.gallery,
      }
    : fromMock

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 320)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!property) {
    return (
      <div className="min-h-screen bg-deep flex items-center justify-center">
        <p className="text-slate-400">Property not found.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="ml-4 text-primary hover:underline"
        >
          Go home
        </button>
      </div>
    )
  }

  const gallery = property.gallery || [property.image]
  const mainImage = gallery[selectedImage] || gallery[0]
  const thumbnails = gallery.slice(0, 5)

  return (
    <div className="min-h-screen bg-deep pb-24 md:pb-0">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 w-full bg-deep/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="text-lg font-semibold text-white tracking-tight">
            LahorePropertyGuide<span className="text-primary">.com</span>
          </Link>
        </div>
      </nav>

      {/* Sticky sub-nav */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: sticky ? 1 : 0,
          y: sticky ? 0 : -10,
          pointerEvents: sticky ? 'auto' : 'none',
        }}
        className="fixed top-14 left-0 right-0 z-40 py-3 px-4 bg-deep/95 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-primary">PKR {property.price}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{property.size}</span>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-glow hover:opacity-90"
          >
            Contact Agent
          </button>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back */}
        <motion.button
          type="button"
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white text-sm font-medium mb-4 transition-colors"
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={fadeTransition}
        >
          ← Back to home
        </motion.button>

        {/* 1. Image gallery */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-10"
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.06 } },
          }}
        >
          <motion.div
            variants={fadeUp}
            className="lg:col-span-3 relative rounded-2xl overflow-hidden bg-slate-800 aspect-[16/10]"
          >
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors shadow-lg"
              >
                View All Photos
              </button>
            </div>
          </motion.div>
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 lg:gap-3">
            {thumbnails.map((img, i) => (
              <motion.button
                key={i}
                type="button"
                variants={fadeUp}
                onClick={() => setSelectedImage(i)}
                className={`relative rounded-xl overflow-hidden aspect-video lg:aspect-[4/3] ${
                  selectedImage === i ? 'ring-2 ring-primary' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* 2. Property overview */}
        <motion.section
          className="mb-10"
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={fadeTransition}
        >
          <p className="text-primary text-sm font-medium mb-1">{property.location}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{property.title}</h1>
          <p className="text-3xl sm:text-4xl font-bold text-primary mb-6">PKR {property.price}</p>

          <div className="flex flex-wrap gap-6 text-slate-300 mb-6">
            <span className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-primary" />
              {property.beds} Beds
            </span>
            <span className="flex items-center gap-2">
              <Bath className="w-5 h-5 text-primary" />
              {property.baths} Baths
            </span>
            <span className="flex items-center gap-2">
              <Square className="w-5 h-5 text-primary" />
              {property.marlas} Marlas
            </span>
            <span className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              Facing {property.facing}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/40 text-primary font-semibold shadow-glow">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            AI Rated: {((property.aiScore ?? 0) / 10).toFixed(1)}/10 High Growth Potential
          </div>
        </motion.section>

        {/* 3. AI Insights + ROI Calculator */}
        <motion.section
          className="mb-10 rounded-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-md border border-white/10"
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={fadeTransition}
        >
          <h2 className="text-xl font-semibold text-white mb-4">AI Investment Analysis</h2>
          <div className="mb-6">
            <ROICalculator property={property} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Rental Yield Estimate</p>
              <p className="text-2xl font-bold text-primary">{property.rentalYield}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Why this property?</p>
              <ul className="space-y-2">
                {(property.whyThisProperty || []).map((item, i) => (
                  <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 4. Location & Amenities */}
        <motion.section
          className="mb-10"
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={fadeTransition}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Location & Amenities</h2>
          <div className="rounded-2xl overflow-hidden bg-slate-800/60 h-56 flex items-center justify-center text-slate-500 border border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Google Maps placeholder
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: 'Gated Community' },
              { icon: Zap, label: 'Electricity' },
              { icon: Flame, label: 'Gas' },
              { icon: Trees, label: 'Park' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3"
              >
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-slate-300 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. Legal */}
        <motion.section
          className="mb-10"
          initial="initial"
          animate="animate"
          variants={fadeUp}
          transition={fadeTransition}
        >
          <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 w-fit">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <p className="text-white font-medium">Verified</p>
              <p className="text-slate-400 text-sm">{property.legalStatus}</p>
            </div>
          </div>
        </motion.section>
      </div>

      {/* 6. Floating action bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-deep/95 backdrop-blur-md border-t border-white/10 md:hidden">
        <div className="max-w-lg mx-auto flex gap-3">
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
          <a
            href="tel:+923001234567"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold shadow-glow"
          >
            <Phone className="w-5 h-5" />
            Call
          </a>
        </div>
      </div>
    </div>
  )
}
