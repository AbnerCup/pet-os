'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePets } from '@/hooks/usePets'
import { Wallet, TrendingUp, TrendingDown, Plus, Calendar, Filter, PieChart, BarChart3 } from 'lucide-react'

export default function ExpensesPage() {
  const { user } = useAuth()
  const { pets } = usePets()
  const [selectedPet, setSelectedPet] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    petId: '',
    category: 'medical',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Mock data for expenses
  const [expenses] = useState([
    {
      id: '1',
      petId: '1',
      category: 'medical',
      amount: 150,
      description: 'Vacuna antirrábica',
      date: '2024-01-15',
      petName: 'Luna'
    },
    {
      id: '2',
      petId: '1',
      category: 'food',
      amount: 85,
      description: 'Alimento premium 15kg',
      date: '2024-01-10',
      petName: 'Luna'
    },
    {
      id: '3',
      petId: '2',
      category: 'grooming',
      amount: 45,
      description: 'Baño y corte',
      date: '2024-01-08',
      petName: 'Max'
    },
    {
      id: '4',
      petId: '1',
      category: 'medical',
      amount: 200,
      description: 'Consulta veterinaria',
      date: '2024-01-05',
      petName: 'Luna'
    }
  ])

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
    return true
  })

  const totalByCategory = categories.map(category => ({
    ...category,
    total: expenses.filter(e => e.category === category.value).reduce((sum, e) => sum + e.amount, 0)
  })).filter(cat => cat.total > 0)

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).reduce((sum, e) => sum + e.amount, 0)

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
    <div className="max-w-6xl mx-auto">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Total gastado</span>
            <Wallet className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">${totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-stone-500 mt-1">Todos los tiempos</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Este mes</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-sage-900">${thisMonthExpenses.toFixed(2)}</p>
          <p className="text-sm text-stone-500 mt-1">Enero 2024</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-600">Promedio mensual</span>
            <BarChart3 className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-3xl font-bold text-sage-900">${(totalExpenses / 3).toFixed(2)}</p>
          <p className="text-sm text-stone-500 mt-1">Últimos 3 meses</p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 border border-sage-200 mb-6">
          <h3 className="text-lg font-semibold text-sage-900 mb-4">Agregar Nuevo Gasto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Mascota</label>
              <select
                value={formData.petId}
                onChange={(e) => setFormData({...formData, petId: e.target.value})}
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
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Ej: Vacuna, comida, juguetes..."
              className="w-full"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button className="btn-primary">
              Guardar Gasto
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Chart */}
        <div className="bg-white rounded-2xl p-6 border border-sage-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-sage-900">Por Categoría</h2>
            <PieChart className="w-5 h-5 text-stone-400" />
          </div>
          <div className="space-y-4">
            {totalByCategory.map(category => {
              const percentage = (category.total / totalExpenses * 100).toFixed(1)
              return (
                <div key={category.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(category.value)}</span>
                      <span className="text-sm font-medium text-stone-700">{category.label}</span>
                    </div>
                    <span className="text-sm font-bold text-sage-900">${category.total}</span>
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
          <div className="bg-white rounded-2xl p-6 border border-sage-200">
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
          <div className="bg-white rounded-2xl p-6 border border-sage-200">
            <h2 className="text-lg font-semibold text-sage-900 mb-4">Historial de Gastos</h2>
            <div className="space-y-3">
              {filteredExpenses.map(expense => {
                const category = categories.find(c => c.value === expense.category)
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-sage-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                      <div>
                        <p className="font-medium text-stone-900">{expense.description}</p>
                        <p className="text-sm text-stone-500">
                          {expense.petName} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sage-900">${expense.amount}</p>
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