"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import Stats from "@/components/stats"
import Benefits from "@/components/benefits"
import HowItWorks from "@/components/how-it-works"
import Requirements from "@/components/requirements"
import CalendarScheduling from "@/components/calendar-scheduling"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero scrollY={scrollY} />
      <Stats />
      <Benefits />
      <HowItWorks />
      <Requirements />
      <CalendarScheduling />
      <Contact />
      <Footer />
    </div>
  )
}
