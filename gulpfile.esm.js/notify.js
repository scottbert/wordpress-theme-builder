import notifier from 'node-notifier';
import { join } from 'path';

function sendNotificationFactory(type) {
    return function sendNotification(error) {
        if (error.stack) {
            console.error(error.stack);
        }

        notifier.notify(
            {
                icon: join(__dirname, '/img/alert.png'),
                contentImage: join(__dirname, '/img/alert.png'),
                title: 'WP Theme Builder',
                subtitle: type,
                message: error.message,
                sound: true,
                timeout: 15
            }
        );
    };
}

export { sendNotificationFactory as notify };
