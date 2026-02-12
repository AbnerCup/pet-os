import { prisma } from '../config/database';
import axios from 'axios';

export const sendPushNotification = async (userId: string, title: string, message: string, data?: any) => {
    try {
        // 1. Guardar en la base de datos para el historial in-app
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: 'REMINDER',
                data: data || {},
            },
        });

        // 2. Obtener el token push del usuario
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushToken: true },
        });

        if (!user?.pushToken) {
            console.log(`[PushService] No push token found for user ${userId}`);
            return;
        }

        // 3. Enviar a Expo Push API
        const response = await axios.post('https://exp.host/--/api/v2/push/send', {
            to: user.pushToken,
            sound: 'default',
            title: title,
            body: message,
            data: data || {},
        });

        console.log(`[PushService] Notification sent to user ${userId}`, response.data);
    } catch (error) {
        console.error(`[PushService] Error sending notification to user ${userId}:`, error);
    }
};
