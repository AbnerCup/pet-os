'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { post } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import {
    Send,
    Bot,
    User,
    Sparkles,
    Loader2,
    Trash2,
    Crown,
    Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
    role: 'user' | 'bot'
    text: string
    timestamp: Date
}

export default function AssistantPage() {
    const { user } = useAuth()
    const isLocked = user?.plan === 'FREE'
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'bot',
            text: '¡Hola! Soy tu asistente de Pet OS. Puedo ayudarte con dudas sobre la salud, vacunas o historial de tus mascotas. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            role: 'user',
            text: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const response = await post('/api/chatbot/ask', { prompt: input })

            const botMessage: Message = {
                role: 'bot',
                text: response.data.text,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            const errorMessage: Message = {
                role: 'bot',
                text: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo más tarde.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const clearChat = () => {
        setMessages([
            {
                role: 'bot',
                text: '¡Hola! Soy tu asistente de Pet OS. ¿En qué puedo ayudarte hoy?',
                timestamp: new Date()
            }
        ])
    }

    if (isLocked) {
        return (
            <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto justify-center">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-stone-900 mb-2">Asistente AI Premium</h1>
                        <p className="text-stone-600 mb-8 max-w-lg mx-auto">
                            Desbloquea el poder de la Inteligencia Artificial para cuidar a tus mascotas. Obten respuestas expertas sobre salud, vacunas y más, al instante.
                        </p>

                        <div className="bg-white rounded-2xl p-6 mb-8 max-w-md mx-auto shadow-sm text-left">
                            <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                                <Crown className="w-5 h-5 text-amber-500" />
                                Disponible en planes Basic y Family
                            </h3>
                            <ul className="space-y-3 text-stone-600">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <Bot className="w-3 h-3 text-green-600" />
                                    </div>
                                    Consultas veterinarias inteligentes
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-blue-600" />
                                    </div>
                                    Análisis de historial médico
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-3 h-3 text-purple-600" />
                                    </div>
                                    Respuestas inmediatas 24/7
                                </li>
                            </ul>
                        </div>

                        <a
                            href="/pricing?upgrade=ai"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-1"
                        >
                            <Crown className="w-5 h-5" />
                            Actualizar Plan
                        </a>
                        <p className="mt-4 text-xs text-stone-400">Desde Bs. 50/mes. Cancela cuando quieras.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-sage-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sage-900 text-lg">Asistente Virtual</h1>
                        <p className="text-xs text-stone-500">Impulsado por Gemini AI</p>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Limpiar chat"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-white rounded-2xl border border-sage-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex items-start gap-3 max-w-[85%]",
                                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                                    m.role === 'user' ? "bg-sage-600" : "bg-indigo-600"
                                )}>
                                    {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                                </div>
                                <div className={cn(
                                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                                    m.role === 'user'
                                        ? "bg-sage-600 text-white rounded-tr-none"
                                        : "bg-stone-50 text-stone-800 border border-stone-100 rounded-tl-none"
                                )}>
                                    {m.text}
                                    <p className={cn(
                                        "text-[10px] mt-2 opacity-50 text-right",
                                        m.role === 'user' ? "text-white" : "text-stone-500"
                                    )}>
                                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                <div className="flex gap-1.5 py-1">
                                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t border-sage-100 bg-stone-50/50">
                    <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pregunta sobre tus mascotas (ej: ¿Cómo está Toby?)"
                            disabled={isLoading}
                            className="w-full bg-white border border-sage-200 rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:ring-4 focus:ring-sage-500/10 focus:border-sage-500 transition-all disabled:opacity-50 shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2.5 p-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:opacity-40 disabled:hover:bg-sage-600 transition-all shadow-md active:scale-95"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-3 text-center uppercase tracking-wider font-semibold">
                        Inteligencia Artificial • Pet OS Assistant
                    </p>
                </form>
            </div>
        </div>
    )
}
