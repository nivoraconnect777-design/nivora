import webpush from 'web-push';
import prisma from '../lib/prisma';

// Helper to initialize web-push
// In production, these should be in environment variables
const publicVapidKey = 'BKXoTvbbjBNL8F_al8XG0lqsc6JMZlMtcf8X57QrKUKPncsCIIL9GpOfUg-z-o-UOkN0U7TjiOV_mAXIJ3GVQvk';
const privateVapidKey = '4irbiwxPg3rjK1PJ8sxiAHiO-WL7zRwU1_xPQl0sl-0';

webpush.setVapidDetails(
    'mailto:anita@nivora.app',
    publicVapidKey,
    privateVapidKey
);

export const saveSubscription = async (userId: string, subscription: any) => {
    try {
        // Check if subscription already exists for this endpoint
        const existing = await prisma.pushSubscription.findUnique({
            where: { endpoint: subscription.endpoint },
        });

        if (existing) {
            // Update if needed, or just return
            if (existing.userId !== userId) {
                await prisma.pushSubscription.update({
                    where: { id: existing.id },
                    data: { userId },
                });
            }
            return existing;
        }

        // Create new
        return await prisma.pushSubscription.create({
            data: {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                userId,
            },
        });
    } catch (error) {
        console.error('Error saving subscription:', error);
        throw error;
    }
};

export const sendPushNotification = async (userId: string, payload: any) => {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        const notificationPayload = JSON.stringify(payload);

        const promises = subscriptions.map((sub) =>
            webpush
                .sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: sub.keys as any,
                    },
                    notificationPayload
                )
                .catch(async (err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription is gone, delete it
                        console.log('Subscription expired, deleting:', sub.id);
                        await prisma.pushSubscription.delete({ where: { id: sub.id } });
                    } else {
                        console.error('Error sending push:', err);
                    }
                })
        );

        await Promise.all(promises);
    } catch (error) {
        console.error('Error sending push notifications:', error);
    }
};
