import UtilityBar from '../components/landing/UtilityBar'
import Header from '../components/landing/Header'
import Hero from '../components/landing/Hero'
import StatsStrip from '../components/landing/StatsStrip'
import InfoSection from '../components/landing/InfoSection'
import WorkflowSection from '../components/landing/WorkflowSection'
import RolesSection from '../components/landing/RolesSection'
import PillarsSection from '../components/landing/PillarsSection'
import CtaBand from '../components/landing/CtaBand'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <UtilityBar />
      <Header />
      <main>
        <Hero />
        <StatsStrip />
        <InfoSection />
        <WorkflowSection />
        <RolesSection />
        <PillarsSection />
        <CtaBand />
      </main>
      <Footer />
    </div>
  )
}
