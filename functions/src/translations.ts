export const translations = {
    en: {
        tribeInvite(tribeName: string) {
            return `You have been invited to the tribe ${tribeName}`;
        },
        tribeRemove(tribeName: string) {
            return `You have been removed from the tribe ${tribeName}`;
        },
        friendAdded(friendName: string) {
            return `${friendName} added you to their friends`;
        }
    },
    de: {
        tribeInvite(tribeName: string) {
            return `Du wurdest in den Tribe ${tribeName} eingeladen`;
        },
        tribeRemove(tribeName: string) {
            return `Du wurdest aus dem Tribe ${tribeName} entfernt`;
        },
        friendAdded(friendName: string) {
            return `${friendName} hat dich zu Freunden hinzugefügt`;
        }
    }
};
