'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { Wallet, TrendingUp, TrendingDown, Plus, Calendar, Filter, PieChart, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react'

// Definir URL base API
const ENV_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const API_URL = ENV_URL.endsWith('/api') ? ENV_URL : `${ENV_URL}/api`

interface Expense {
  id: string
  petId: string
  category: string
  amount: number
  description: string
  date: string
  pet: {
    name: string
  }
}

export default function ExpensesPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedPet, setSelectedPet] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    petId: '',
    category: 'medical',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Cargar gastos
  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No has iniciado sesión')
        return
      }

      // Obtener últimos 100 gastos
      const res = await fetch(`${API_URL}/expenses?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Error al obtener gastos')

      const json = await res.json()
      if (json.success) {
        setExpenses(json.data)
        setError(null)
      } else {
        setError(json.error || 'Error desconocido')
      }
    } catch (err) {
      console.error(err)
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  // Crear gasto
  const handleSaveExpense = async () => {
    if (!formData.petId || !formData.amount || !formData.date) {
      alert('Por favor completa los campos requeridos')
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem('token')

      const payload = {
        petId: formData.petId,
        category: formData.category,
        amount: formData.amount.toString(),
        description: formData.description,
        date: new Date(formData.date).toISOString() // Convertir a ISO
      }

      const res = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const json = await res.json()

      if (!res.ok) {
        alert(json.error || 'Error al guardar')
        return
      }

      // Éxito
      setShowAddForm(false)
      setFormData({
        petId: '',
        category: 'medical',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      fetchExpenses() // Recargar lista

    } catch (err) {
      console.error(err)
      alert('Error de conexión al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: 'medical', label: 'Salud', color: 'bg-red-500' },
    { value: 'food', label: 'Alimento', color: 'bg-blue-500' },
    { value: 'grooming', label: 'Estética', color: 'bg-purple-500' },
    { value: 'toys', label: 'Juguetes', color: 'bg-green-500' },
    { value: 'accessories', label: 'Accesorios', color: 'bg-yellow-500' },
    { value: 'other', label: 'Otros', color: 'bg-gray-500' }
  ]

  const filteredExpenses = expenses.filter(expense => {
    if (selectedPet && expense.petId !== selectedPet) return false

    // Filtro de periodo simple
    const expenseDate = new Date(expense.date)
    const now = new Date()
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      return expenseDate >= weekAgo
    }
    if (selectedPeriod === 'month') {
      return expenseDate.getMonth() === new Date().getMonth() &&
        expenseDate.getFullYear() === new Date().getFullYear()
    }
    if (selectedPeriod === 'year') {
      return expenseDate.getFullYear() === new Date().getFullYear()
    }

    return true
  })

  // Calcular totales
  const totalByCategory = categories.map(category => ({
    ...category,
    total: expenses.filter(e => e.category === category.value).reduce((sum, e) => sum + Number(e.amount), 0)
  })).filter(cat => cat.total > 0)

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).reduce((sum, e) => sum + Number(e.amount), 0)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return '💊'
      case 'food': return '🍖'
      case 'grooming': return '✂️'
      case 'toys': return '🎾'
      case 'accessories': return '🦴'
      default: return '📦'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sage-900">Gastos</h1>
          <p className="text-stone-600">Controla los gastos de tus mascotas</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Gasto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Total gastado</span>
            <Wallet className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">Bs. {totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-stone-500 mt-1">
            {selectedPeriod === 'month' ? 'Este mes' :
              selectedPeriod === 'week' ? 'Esta semana' : 'Total periodo'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Este mes</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">Bs. {thisMonthExpenses.toFixed(2)}</p>
          <p className="text-sm text-stone-500 mt-1">Gastos del mes actual</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Actualizar</span>
            <button onClick={fetchExpenses} title="Recargar datos">
              <RefreshCw className={`w-5 h-5 text-stone-400 hover:text-sage-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            {loading ? 'Cargando...' : `${expenses.length} registros obtenidos`}
          </p>

        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6 shadow-md animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-sage-900 mb-4">Agregar Nuevo Gasto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mascota</label>
              <select
                value={formData.petId}
                onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                className="w-full"
              >
                <option value="">Seleccionar...</option>
                {pets?.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Monto (Bs.)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: Vacuna, comida, juguetes..."
              className="w-full"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveExpense}
              disabled={isSubmitting}
              className="btn-primary px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Gasto'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Chart */}
        <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-sage-900">Por Categoría</h2>
            <PieChart className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
            {totalExpenses === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No hay gastos para mostrar</p>
            )}
            {totalByCategory.map(category => {
              const percentage = (category.total / totalExpenses * 100).toFixed(1)
              return (
                <div key={category.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(category.value)}</span>
                      <span className="text-sm font-medium text-stone-700">{category.label}</span>
                    </div>
                    <span className="text-sm font-bold text-sage-900">Bs. {category.total.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-stone-500 text-right">{percentage}%</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filters and Expenses List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-sage-900">Filtros</h2>
              <Filter className="w-5 h-5 text-stone-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Mascota</label>
                <select
                  value={selectedPet}
                  onChange={(e) => setSelectedPet(e.target.value)}
                  className="w-full"
                >
                  <option value="">Todas las mascotas</option>
                  {pets?.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Período</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full"
                >
                  <option value="week">Última semana</option>
                  <option value="month">Último mes</option>
                  <option value="year">Último año</option>
                  <option value="all">Todos los tiempos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-2xl p-6 border border-sage-200 shadow-sm">
            <h2 className="text-lg font-semibold text-sage-900 mb-4">Historial de Gastos</h2>
            <div className="space-y-3">
              {filteredExpenses.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No hay gastos registrados en este periodo.</p>
                </div>
              )}

              {filteredExpenses.map(expense => {
                const category = categories.find(c => c.value === expense.category)
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-sage-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                      <div>
                        <p className="font-medium text-stone-900">{expense.description || category?.label}</p>
                        <p className="text-sm text-stone-500">
                          {expense.pet?.name || 'Mascota'} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sage-900">Bs. {Number(expense.amount).toFixed(2)}</p>
                      <p className="text-xs text-stone-500">{category?.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}