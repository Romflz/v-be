import admin from 'firebase-admin'

interface EnvCred {
  projectId: string
  clientEmail: string
  privateKey: string
}

function readEnvCredentials(): EnvCred {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_CLOUD_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_CLOUD_PRIVATE_KEY

  const missing: string[] = []
  if (!projectId) missing.push('PROJECT_ID')
  if (!clientEmail) missing.push('CLIENT_EMAIL')
  if (!privateKey) missing.push('PRIVATE_KEY')
  if (missing.length) {
    throw new Error('Missing Firebase env vars: ' + missing.join(', '))
  }

  if (privateKey!.includes('\\n')) privateKey = privateKey!.replace(/\\n/g, '\n')
  return { projectId: projectId!, clientEmail: clientEmail!, privateKey: privateKey! }
}

function initFirebase(): admin.app.App {
  if (admin.apps.length) return admin.apps[0]!
  const cred = readEnvCredentials()
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: cred.projectId,
      clientEmail: cred.clientEmail,
      privateKey: cred.privateKey,
    }),
  })
}

export const firebaseApp = initFirebase()
export const firebaseAuth = admin.auth(firebaseApp)

export async function verifyIdToken(idToken: string) {
  if (!idToken) throw new Error('Missing ID token')
  return firebaseAuth.verifyIdToken(idToken, true)
}
