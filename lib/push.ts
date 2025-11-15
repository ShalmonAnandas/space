import webpush from 'web-push';
import { prisma } from './prisma';
import { getNotificationText } from './notifications';

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:support@space.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

type NotificationType = 'sutta_normal' | 'sutta_sos' | 'mood' | 'gossip' | 'frustration';

interface NotificationPayload {
  name: string;
  mood?: string;
  frustration?: 'project' | 'junior' | 'resign';
}

export async function sendNotification(
  userId: string,
  spaceId: string,
  type: NotificationType,
  payload: NotificationPayload
) {
  const { title, body } = getNotificationText(type, payload);

  // Always save to NotificationQueue for in-app fallback
  await prisma.notificationQueue.create({
    data: {
      userId,
      spaceId,
      type,
      content: {
        title,
        body,
        ...payload,
      },
      read: false,
    },
  });

  // Try to send push notification
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const pushPromises = subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          sub.subscription as any,
          JSON.stringify({ title, body })
        );
      } catch (error: any) {
        // If subscription is expired/invalid, delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
        throw error;
      }
    });

    await Promise.allSettled(pushPromises);
  } catch (error) {
    console.error('Error sending push notifications:', error);
    // Don't throw - notification is saved in queue anyway
  }
}
