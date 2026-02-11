// ============================================
// EJEMPLOS DE COMPONENTES REACT USANDO LOS HOOKS
// ============================================

import React, { useState } from 'react'
import { useAuth, usePets, useHealthRecords, useExpenses } from '../hooks'

// ============================================
// 1. Componente de Login
// ============================================

export function LoginPage() {
    const { login, loading, error } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const result = await login(email, password)

        if (result.success) {
            window.location.href = '/dashboard'
        }
    }

    return (
        <div className="login-container">
            <h1>Iniciar Sesión - Pet OS</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <div className="error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    )
}

// ============================================
// 2. Componente de Registro
// ============================================

export function RegisterPage() {
    const { register, loading, error } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const result = await register(formData)

        if (result.success) {
            window.location.href = '/dashboard'
        }
    }

    return (
        <div className="register-container">
            <h1>Crear Cuenta - Pet OS</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Nombre completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="tel"
                    name="phone"
                    placeholder="Teléfono (opcional)"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {error && <div className="error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Registrarse'}
                </button>
            </form>
        </div>
    )
}

// ============================================
// 3. Lista de Mascotas
// ============================================

export function PetsList() {
    const { pets, loading, error, deletePet } = usePets()
    const [showAddForm, setShowAddForm] = useState(false)

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Eliminar a ${name}?`)) {
            const result = await deletePet(id)

            if (result.success) {
                alert('Mascota eliminada correctamente')
            } else {
                alert(`Error: ${result.error}`)
            }
        }
    }

    if (loading) {
        return <div>Cargando mascotas...</div>
    }

    if (error) {
        return <div className="error">Error: {error}</div>
    }

    return (
        <div className="pets-list">
            <div className="header">
                <h2>Mis Mascotas</h2>
                <button onClick={() => setShowAddForm(true)}>
                    + Agregar Mascota
                </button>
            </div>

            {pets.length === 0 ? (
                <p>No tienes mascotas registradas aún.</p>
            ) : (
                <div className="pets-grid">
                    {pets.map(pet => (
                        <div key={pet.id} className="pet-card">
                            {pet.photoUrl && (
                                <img src={pet.photoUrl} alt={pet.name} />
                            )}

                            <h3>{pet.name}</h3>
                            <p>{pet.species} {pet.breed && `- ${pet.breed}`}</p>

                            {pet.weight && <p>Peso: {pet.weight} kg</p>}

                            {pet.birthDate && (
                                <p>Edad: {calculateAge(pet.birthDate)}</p>
                            )}

                            <div className="actions">
                                <button onClick={() => window.location.href = `/pets/${pet.id}`}>
                                    Ver Detalles
                                </button>
                                <button
                                    onClick={() => handleDelete(pet.id!, pet.name)}
                                    className="danger"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddForm && (
                <AddPetModal onClose={() => setShowAddForm(false)} />
            )}
        </div>
    )
}

// ============================================
// 4. Formulario para Agregar Mascota
// ============================================

function AddPetModal({ onClose }: { onClose: () => void }) {
    const { addPet } = usePets()
    const [formData, setFormData] = useState({
        name: '',
        species: 'perro',
        breed: '',
        birthDate: '',
        weight: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await addPet({
            name: formData.name,
            species: formData.species,
            breed: formData.breed || undefined,
            birthDate: formData.birthDate || undefined,
            weight: formData.weight ? parseFloat(formData.weight) : undefined
        })

        setLoading(false)

        if (result.success) {
            alert('Mascota agregada correctamente')
            onClose()
        } else {
            alert(`Error: ${result.error}`)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Agregar Nueva Mascota</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <select
                        value={formData.species}
                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    >
                        <option value="perro">Perro</option>
                        <option value="gato">Gato</option>
                        <option value="ave">Ave</option>
                        <option value="otro">Otro</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Raza (opcional)"
                        value={formData.breed}
                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    />

                    <input
                        type="date"
                        placeholder="Fecha de nacimiento"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    />

                    <input
                        type="number"
                        step="0.1"
                        placeholder="Peso (kg)"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />

                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ============================================
// 5. Detalle de Mascota con Tabs
// ============================================

export function PetDetailPage({ petId }: { petId: string }) {
    const { pets } = usePets()
    const [activeTab, setActiveTab] = useState<'health' | 'expenses' | 'activities'>('health')

    const pet = pets.find(p => p.id === petId)

    if (!pet) {
        return <div>Mascota no encontrada</div>
    }

    return (
        <div className="pet-detail">
            <div className="pet-header">
                <h1>{pet.name}</h1>
                <p>{pet.species} {pet.breed && `- ${pet.breed}`}</p>
            </div>

            <div className="tabs">
                <button
                    className={activeTab === 'health' ? 'active' : ''}
                    onClick={() => setActiveTab('health')}
                >
                    Salud
                </button>
                <button
                    className={activeTab === 'expenses' ? 'active' : ''}
                    onClick={() => setActiveTab('expenses')}
                >
                    Gastos
                </button>
                <button
                    className={activeTab === 'activities' ? 'active' : ''}
                    onClick={() => setActiveTab('activities')}
                >
                    Actividades
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'health' && <HealthTab petId={petId} />}
                {activeTab === 'expenses' && <ExpensesTab petId={petId} />}
                {activeTab === 'activities' && <ActivitiesTab petId={petId} />}
            </div>
        </div>
    )
}

// ============================================
// 6. Tab de Salud
// ============================================

function HealthTab({ petId }: { petId: string }) {
    const { records, upcomingAppointments, loading, error, addRecord } = useHealthRecords(petId)
    const [showForm, setShowForm] = useState(false)

    if (loading) return <div>Cargando...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="health-tab">
            <div className="section">
                <h3>Próximas Citas</h3>
                {upcomingAppointments.length === 0 ? (
                    <p>No hay citas próximas</p>
                ) : (
                    <ul>
                        {upcomingAppointments.map(record => (
                            <li key={record.id}>
                                <strong>{record.title}</strong> - {formatDate(record.nextDate!)}
                                {record.vetName && <span> con {record.vetName}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="section">
                <div className="section-header">
                    <h3>Historial Médico</h3>
                    <button onClick={() => setShowForm(true)}>+ Agregar</button>
                </div>

                {records.map(record => (
                    <div key={record.id} className="health-record">
                        <h4>{record.title}</h4>
                        <p>Tipo: {record.type}</p>
                        <p>Fecha: {formatDate(record.date)}</p>
                        {record.vetName && <p>Veterinario: {record.vetName}</p>}
                        {record.notes && <p>Notas: {record.notes}</p>}
                        <span className={`status ${record.status}`}>
                            {record.status === 'pending' ? 'Pendiente' : 'Completado'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================
// 7. Tab de Gastos
// ============================================

function ExpensesTab({ petId }: { petId: string }) {
    const { expenses, total, byCategory, loading, error } = useExpenses(petId)

    if (loading) return <div>Cargando...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="expenses-tab">
            <div className="summary">
                <h3>Total Gastado: ${total.toFixed(2)}</h3>

                <div className="categories">
                    <h4>Por Categoría:</h4>
                    {Object.entries(byCategory).map(([category, amount]) => (
                        <div key={category} className="category-item">
                            <span>{category}</span>
                            <span>${amount.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="expenses-list">
                <h3>Historial de Gastos</h3>
                {expenses.map(expense => (
                    <div key={expense.id} className="expense-item">
                        <div>
                            <strong>{expense.category}</strong>
                            {expense.description && <p>{expense.description}</p>}
                            <small>{formatDate(expense.date)}</small>
                        </div>
                        <div className="amount">${Number(expense.amount).toFixed(2)}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================
// 8. Tab de Actividades
// ============================================

function ActivitiesTab({ petId }: { petId: string }) {
    const { activities, totalMinutes, loading, error } = useActivities(petId)

    if (loading) return <div>Cargando...</div>
    if (error) return <div className="error">{error}</div>

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return (
        <div className="activities-tab">
            <div className="summary">
                <h3>Tiempo Total de Actividad</h3>
                <p className="total-time">
                    {hours > 0 && `${hours}h `}
                    {minutes}min
                </p>
            </div>

            <div className="activities-list">
                {activities.map(activity => (
                    <div key={activity.id} className="activity-item">
                        <div>
                            <strong>{activity.type}</strong>
                            <p>Duración: {activity.duration} minutos</p>
                            <small>{formatDate(activity.date)}</small>
                            {activity.notes && <p className="notes">{activity.notes}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================
// UTILIDADES
// ============================================

function calculateAge(birthDate: string): string {
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()

    if (years === 0) {
        return `${months} ${months === 1 ? 'mes' : 'meses'}`
    }

    return `${years} ${years === 1 ? 'año' : 'años'}`
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
