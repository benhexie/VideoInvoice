import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

export { auth, storage };
export { firestore as db };

export const GOOGLE_WEB_CLIENT_ID = "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";
export const GOOGLE_IOS_CLIENT_ID = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";
