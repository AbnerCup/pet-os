import { Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '../config/database'
import { AuthRequest } from '../types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export const askChatbot = async (req: AuthRequest, res: Response) => {
    const { prompt } = req.body
    const userId = req.user?.id
    const userPlan = req.user?.plan || 'FREE'

    if (!userId) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        })
    }

    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Se requiere un prompt'
        })
    }

    try {
        // --- LÓGICA DE LÍMITES ---
        // --- LÓGICA DE LÍMITES ---
        if (userPlan === 'BASIC') {
            // Límite diario: 3 preguntas
            const now = new Date();
            const startDate = new Date(now.setHours(0, 0, 0, 0));

            const usageCount = await prisma.chatbotInteraction.count({
                where: {
                    userId,
                    createdAt: {
                        gte: startDate
                    }
                }
            });

            const limit = 3;
            if (usageCount >= limit) {
                return res.status(403).json({
                    success: false,
                    error: `Has alcanzado tu límite diario de preguntas (${limit}). Actualiza a Family para acceso ilimitado.`
                });
            }
        } else if (userPlan === 'FREE') {
            return res.status(403).json({
                success: false,
                error: 'El Asistente AI solo está disponible para planes Basic y Family.'
            });
        }

        // 1. Consultar estadísticas de las mascotas del usuario en Prisma
        const pets = await prisma.pet.findMany({
            where: { userId },
            select: {
                name: true,
                species: true,
                breed: true,
                weight: true,
                birthDate: true,
                healthRecords: {
                    select: {
                        type: true,
                        title: true,
                        date: true,
                        notes: true
                    },
                    orderBy: { date: 'desc' },
                    take: 5
                }
            }
        })

        // 2. Construir el "Contexto" para Gemini
        const contextoSystem = `
        Eres un asistente veterinario experto para la plataforma Pet OS. 
        Datos reales de las mascotas del usuario: ${JSON.stringify(pets)}.
        
        Instrucciones:
        - Responde basándote SOLO en estos datos si el usuario pregunta sobre la salud o historial de sus mascotas.
        - Si el usuario pregunta algo que no está en el registro (como una vacuna específica no listada), dile que no tienes ese registro médico en Pet OS y recomiéndale contactar a su veterinario de confianza.
        - Sé empático, profesional y conciso.
        - Responde en español.
    `

        // 3. Enviar a Gemini con el contexto y el prompt del usuario
        const result = await model.generateContent([contextoSystem, prompt])
        const response = await result.response
        const text = response.text()

        // --- REGISTRAR INTERACCIÓN ---
        await prisma.chatbotInteraction.create({
            data: {
                userId,
                prompt,
                response: text
            }
        });

        res.json({
            success: true,
            data: { text }
        })

    } catch (error: any) {
        console.error('[CHATBOT_ERROR]', error)
        res.status(500).json({
            success: false,
            error: 'Error al procesar la consulta con el asistente de IA',
            details: error.message || JSON.stringify(error)
        })
    }
}
