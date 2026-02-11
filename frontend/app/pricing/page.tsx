'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Crown, Check, X, Star, Zap, Shield, Heart, ArrowRight, CreditCard } from 'lucide-react'

export default function PricingPage() {
  const searchParams = useSearchParams()
  const { user, upgradePlan } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const upgradeFeature = searchParams.get('upgrade')

  const plans = [
    {
      id: 'FREE',
      name: 'Gratis',
      price: '0',
      period: 'para siempre',
      description: 'Perfecto para comenzar',
      color: 'from-stone-400 to-stone-600',
      features: [
        { included: true, text: '1 mascota' },
        { included: true, text: 'Registros básicos' },
        { included: true, text: 'Dashboard simple' },
        { included: true, text: 'Recordatorios básicos' },
        { included: false, text: 'Seguimiento GPS' },
        { included: false, text: 'Análisis avanzado' },
        { included: false, text: 'Emergencia SOS' }
      ],
      cta: 'Plan Actual',
      popular: false
    },
    {
      id: 'BASIC',
      name: 'Básico',
      price: '25',
      period: 'mensual',
      description: 'Para dueños activos',
      color: 'from-blue-500 to-blue-700',
      features: [
        { included: true, text: '3 mascotas' },
        { included: true, text: 'Registros completos' },
        { included: true, text: 'Dashboard avanzado' },
        { included: true, text: 'Recordatorios ilimitados' },
        { included: true, text: 'Seguimiento GPS' },
        { included: false, text: 'Análisis avanzado' },
        { included: false, text: 'Emergencia SOS' }
      ],
      cta: 'Actualizar a Básico',
      popular: true
    },
    {
      id: 'FAMILY',
      name: 'Family',
      price: '50',
      period: 'mensual',
      description: 'Para toda la familia',
      color: 'from-amber-500 to-orange-600',
      features: [
        { included: true, text: 'Mascotas ilimitadas' },
        { included: true, text: 'Registros premium' },
        { included: true, text: 'Dashboard con IA' },
        { included: true, text: 'Recordatorios inteligentes' },
        { included: true, text: 'Seguimiento GPS' },
        { included: true, text: 'Análisis avanzado' },
        { included: true, text: 'Emergencia SOS 24/7' }
      ],
      cta: 'Actualizar a Family',
      popular: false
    }
  ]

  useEffect(() => {
    if (upgradeFeature) {
      if (upgradeFeature === 'gps') {
        setSelectedPlan('BASIC')
      } else if (upgradeFeature === 'sos') {
        setSelectedPlan('FAMILY')
      }
    }
  }, [upgradeFeature])

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId)
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      await upgradePlan(planId)
    } catch (error) {
      console.error('Error upgrading plan:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const currentPlanIndex = plans.findIndex(p => p.id === user?.plan)
  const isUpgrade = (planId: string) => {
    const planIndex = plans.findIndex(p => p.id === planId)
    return planIndex > currentPlanIndex
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('gps')) return '📍'
    if (feature.toLowerCase().includes('sos')) return '🚨'
    if (feature.toLowerCase().includes('mascota')) return '🐾'
    if (feature.toLowerCase().includes('registro')) return '📋'
    if (feature.toLowerCase().includes('dashboard')) return '📊'
    if (feature.toLowerCase().includes('recordatorio')) return '⏰'
    if (feature.toLowerCase().includes('análisis')) return '📈'
    return '✨'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-sage-900 mb-4">
          Planes para cada necesidad
        </h1>
        <p className="text-xl text-stone-600 max-w-3xl mx-auto">
          Elige el plan perfecto para cuidar a tus mascotas. 
          {user?.plan && `Tu plan actual: ${user.plan}`}
        </p>
      </div>

      {/* Feature highlight if coming from upgrade */}
      {upgradeFeature && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-stone-900">
                {upgradeFeature === 'gps' && 'Desbloquea Seguimiento GPS'}
                {upgradeFeature === 'sos' && 'Desbloquea Emergencia SOS'}
                {upgradeFeature === 'premium' && 'Actualiza a Premium'}
              </h3>
              <p className="text-stone-600 text-sm">
                {upgradeFeature === 'gps' && 'Rastrea la ubicación de tus mascotas en tiempo real'}
                {upgradeFeature === 'sos' && 'Recibe atención veterinaria de emergencia 24/7'}
                {upgradeFeature === 'premium' && 'Accede a todas las características premium'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => {
          const isCurrentPlan = user?.plan === plan.id
          const isUpgradePlan = isUpgrade(plan.id)
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 ${
                plan.popular ? 'border-sage-500 shadow-xl' : 'border-sage-200'
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-sage-600 to-sage-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Más Popular
                  </div>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Plan Actual
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className={`h-2 bg-gradient-to-r ${plan.color} rounded-full mb-6`} />
                
                <h3 className="text-2xl font-bold text-stone-900 mb-2">{plan.name}</h3>
                <p className="text-stone-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-stone-900">${plan.price}</span>
                  <span className="text-stone-600">/{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <span className="text-lg">
                        {getFeatureIcon(feature.text)}
                      </span>
                      <span className={`text-sm ${feature.included ? 'text-stone-900' : 'text-stone-400'}`}>
                        {feature.text}
                      </span>
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 ml-auto" />
                      ) : (
                        <X className="w-4 h-4 text-stone-300 ml-auto" />
                      )}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    isCurrentPlan
                      ? 'bg-stone-100 text-stone-500 cursor-not-allowed'
                      : isUpgradePlan
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {isCurrentPlan ? 'Plan Actual' : isUpgradePlan ? plan.cta : 'Downgrade'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl p-8 border border-sage-200 mb-8">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Preguntas Frecuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">¿Puedo cambiar de plan?</h3>
            <p className="text-stone-600 text-sm">
              Sí, puedes actualizar o cambiar tu plan en cualquier momento. 
              Los cambios se aplican inmediatamente.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">¿Hay cargos ocultos?</h3>
            <p className="text-stone-600 text-sm">
              No. El precio que ves es el precio que pagas. Sin cargos ocultos ni comisiones.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">¿Puedo cancelar cuando quiera?</h3>
            <p className="text-stone-600 text-sm">
              Claro que sí. Puedes cancelar tu suscripción en cualquier momento sin penalidades.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 mb-2">¿Qué métodos de pago aceptan?</h3>
            <p className="text-stone-600 text-sm">
              Aceptamos tarjetas de crédito/débito, PayPal y transferencias bancarias locales.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-sage-600 to-sage-700 rounded-2xl p-8 text-center text-white">
        <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">
          ¿Listo para dar lo mejor a tus mascotas?
        </h2>
        <p className="text-sage-100 mb-6 max-w-2xl mx-auto">
          Únete a miles de dueños que confían en Pet OS para cuidar a sus compañeros peludos.
        </p>
        <button
          onClick={() => handlePlanSelect('BASIC')}
          disabled={isProcessing}
          className="bg-white text-sage-700 px-8 py-3 rounded-xl font-semibold hover:bg-sage-50 transition-all flex items-center gap-2 mx-auto"
        >
          <CreditCard className="w-5 h-5" />
          {isProcessing ? 'Procesando...' : 'Comenzar Ahora'}
        </button>
      </div>
    </div>
  )
}