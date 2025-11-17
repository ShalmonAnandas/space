import webpush from 'web-push';
import { prisma } from './prisma';
import { getNotificationText } from './notifications';

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:support@space.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

type NotificationType = 'sutta_normal' | 'sutta_sos' | 'mood' | 'gossip' | 'frustration' | 'gossip_reaction' | 'notice_seen' | 'vent';

interface NotificationPayload {
  name: string;
  mood?: string;
  frustration?: 'project' | 'junior' | 'resign';
  ventText?: string;
}

export async function sendNotification(
  userId: string,
  spaceId: string,
  type: NotificationType,
  payload: NotificationPayload
) {
  const { title, body } = getNotificationText(type, payload);

  try {
    // Store notification in database for history
    await prisma.notificationQueue.create({
      data: {
        userId,
        spaceId,
        type,
        content: payload as any,
        read: false,
      },
    });

    // Send push notification
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const pushPromises = subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          sub.subscription as any,
          JSON.stringify({ title, body, spaceId }),
          {
            TTL: 3600, // Keep trying to deliver for 1 hour
            urgency: 'high', // High priority delivery
            topic: 'partner-notification', // Replace older notifications of same topic
          }
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
    console.error('Error sending notifications:', error);
  }
}
