import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Notification, type NotificationProps } from "@/domain/notification/enterprise/entities/notification";
import { faker } from "@faker-js/faker";

export function makeNotification(override: Partial<NotificationProps> = {}, id?: UniqueEntityID) {
    return Notification.create({
        title: faker.lorem.sentence({
            min: 3,
            max: 5
        }),
        content: faker.lorem.text(),
        recipientId: new UniqueEntityID(),
        ...override
    }, id)
}