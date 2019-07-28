import { User } from 'firebase';
import { FirebaseAuthProviderIds } from '../models/firebase.model';

export function getProfilePictureInSize(user: User, size: number): string {
    if (user.providerData.length > 0) {
        const userInfo = user.providerData[0];
        if (userInfo.providerId === FirebaseAuthProviderIds.Facebook) {
            return getFacebookProfilePictureInSize(user.photoURL, size);
        } else if (userInfo.providerId === FirebaseAuthProviderIds.Google) {
            return getGoogleProfilePictureInSize(user.photoURL, size);
        }
    }
    return null;
}

export function getFacebookProfilePictureInSize(
    pictureUrl: string,
    size: number
): string {
    return !!pictureUrl ? `${pictureUrl}?height=${size}` : null;
}

export function getGoogleProfilePictureInSize(
    pictureUrl: string,
    size: number
): string {
    return !!pictureUrl ? pictureUrl.replace('/s96-c/', `/s${size}-c/`) : null;
}
