import admin from 'firebase-admin';
import { 
  FIREBASE_STORAGEBUCKET,
  FIREBASE_SERVICE_KEY
} from '$env/static/private';
import { ControlledError } from '../util/util.server';
import type { UserRecord } from 'firebase-admin/auth';

// Convert Base64 back to a JSON string
const serviceAccountJson = Buffer.from(FIREBASE_SERVICE_KEY, 'base64').toString();
// Parse the JSON string back into a JSON object
const serviceAccountObject = JSON.parse(serviceAccountJson);

export type OutputUrls = {[key: string]: string};


export function initializeFirebaseAdmin() {
	if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccountObject as any)
		});
	}
  return admin;
}

export async function authenticateAndReturnUser(idToken: string): Promise<UserRecord> {
  const admin = initializeFirebaseAdmin();

  if (!admin) {
      let err = new Error(`Error during db session initialization.`);
      throw new ControlledError(500, "Error while setting up the backend.", err, { });
  }

  let user;
  try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      user = await admin.auth().getUser(decodedToken.uid);
  } catch (e) {
      throw new ControlledError(401, "Invalid token or user.", e);
  }

  if (!user) {
      throw new ControlledError(401, "Invalid token or user. No user found.", {});
  }

  return user;
}

export async function getFilesFromPath(path: string) {
  const admin = initializeFirebaseAdmin();
  const storage = admin.storage();
  const storageRef = storage.bucket(FIREBASE_STORAGEBUCKET);
  const queryResponse = await storageRef.getFiles({ prefix: path });
  const files = queryResponse[0].filter(file => {
    const name = file.name;
    return !name.endsWith('/');
  });
  return files;
}

export async function getSignedUrlsForFiles(files: any[], daysTilExpire: number): Promise<OutputUrls> {
  const urls: {[key: string]: string} = {};
  // Generate a signed URL for each file
  for (let file of files) {
    // This will give public URL for the file for the next 7 days
    // You can adjust the duration according to your needs
    const config = {
        action: 'read',
        expires: Date.now() + daysTilExpire * 24 * 60 * 60 * 1000, // 7 days in the future
    };

    // Split the filename by "/" and take the last part
    const fileNameParts = file.name.split('/');
    const fileName = fileNameParts[fileNameParts.length - 1];
    const url = await file.getSignedUrl(config);
    urls[fileName] = url[0]; // Assumes file.name is available
  }

  return urls;
}

export async function moveFilesToPath(maxFiles: number, sourcePath: string, destinationPath: string) {
  const files = await getFilesFromPath(sourcePath);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filename = file.name.split('/').pop();
    const newLocation = `${destinationPath}/${filename}`;

    if (i < maxFiles) {
        await file.move(newLocation);
        console.log(`Moved file ${filename} to ${newLocation}`);
    }
    else {
      break;
    }
  }
}

export async function removeFilesAtPath(path: string) {
  const files = await getFilesFromPath(path);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filename = file.name.split('/').pop();
    await file.delete();
    console.log(`Deleted file ${filename} from ${path}`);
  }
}