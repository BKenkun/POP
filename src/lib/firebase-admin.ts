
import admin from 'firebase-admin';

// This configuration uses the service account details you provided,
// ensuring the server-side Admin SDK can always authenticate correctly.
const serviceAccount = {
  "type": "service_account",
  "project_id": "purorush",
  "***REMOVED***_id": "36bda6d9bcb88897880799fd81b7cab8fa6ed215",
  "***REMOVED***": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD9B8Hm0IcWJWFm\nJw0RDwO0a5ZRXZ3RKN1oEEXm6vlj6pB76Xvwuv/vCx82bLw+LhQUQvOR+Hr7rNL5\nsim1otmyJynq3hiy5+D3CgIe+HcTnvs6jHSKYKytcyGltOZtmRbbff3XfhaMKW+a\nVRvNMF9sGXlY15vxM+EDHSRfJEHfVsFqIkJw0hULOVUKGXi1VbFnnL6mJmugbBJF\nsTGXwlNIuUYySWF3JIHy17WWbjoOUXumtMs3MlFd+8anKMG53BJWIlv7jRI2ikx+\nOL4GsAGAew0gvKJgAAtExw7z4yptBVTCwhl/4cHL1xZvfTwCRzrQGDbfWIBQxGjk\niZ7EMZiVAgMBAAECggEAGqePS8kCPfk8mCX7eKVQAtjFijc2KYMoRa7XKkLs+BNM\n2pzHL14HmW8ev902/Ebe2x6NaX5XOD1lsSONRMLNs3hwMDtqtyf5mRR/EjOi2ZiJ\nBwsmOLCD6DalX/8dOgTjNUaBr8pqxiOUS9n01onmt2y8jXkTBpbsOGeAvhwD62qS\n0LTL2vkeavbBkVD4gbXdx0f5RXtlMD7L+7beAb3NMzDXst29uWTZh4fj5/rKJ7v1\nQooJHBHAlxm/kJjsS7ey3A7FT+5zyEU9ppYakBc7CB0mWawgzfqwhvvPdgARKE+g\nswU0wYVFVwAxDTyiZrYO6Z42ROnrxZpnG+L6rt0G2QKBgQD+l/q6jXndDcp/BF9C\nbiJqOOCLbs5qW7L/DtqOysa6ftzfrxETb4wG8VAbpdIAUN32lKaL8JH10uA2szgV\nawg6g7iSxkT8xgIklKKVLJhZDs22SgRtbaBWf0OPWqol+XBtfefmZJKFOk4fMbB7\na/lAz3vgiDG8fWD9qg4u7QY1GQKBgQD+bZE4MLv2UODCA6r/KMoBMgaqqBxv0jUJ\n40pgg4zm7alOd4Xk4XIMbxk/7gtcyk4TwmwAcA+DGvYV5XEZTZ0BmAFer0KM+z4s\nIKlQ2J3oAdVLrxI491MNSZWwWVJDjyG6fz/nRFuGYyUo1x1jxOO0zVm3M447wUlE\nyG91ACoS3QKBgQCmXReJGfO9AEsHTwsUdLVmZf5M/r5Bf+RqiQFGd7j+mvGn9VUa\nNzTwQHXRazzb2fwBKkfef/hRA1hiRiBq1oMNAY/10Tu5VYaG8t1+zyJKZ8MC0EEu\nZIl2nDjAj0VKBUJzOef0hFm+V0g/WA/zxq2crThMk5K0kdV0TNBx147L2QKBgQCy\nE6ImwAVu+2C0qriOatAoUglUfOGaanhw+ULflnOSVhnAL+vpLNoUVdZIZqZRRc+s\nCNJq5AQXcVF4NeUZHrebm/apfOWJo3f6jsmzKkorTs0pcdnBQWpBzJUWnw3y90VW\nMSZbCf89ajtiAF4zrGTr8SawEUemDzznBZrtOzY3iQKBgQDNE3YEcHeiZqT+0+G0\n9LObdDlwhfUMZELf4rRwEZD4W7lM5pzHwojsl3I2dwEu4GY22qNQlJ/E3iMhntEj\nqBSYLYtxGY0ryO5v4uHpXDjzmyoPFXQtaX3cx1WdJ+VW07FdKh0jctdCKtD5bXZC\nIwEOeCRT8coeXAPIdJdB9Y1eUw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@purorush.iam.gserviceaccount.com",
  "client_id": "113987183740078657701",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40purorush.iam.gserviceaccount.com"
};

function getFirebaseAdmin() {
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: "purorush.appspot.com"
        });
        console.log("Firebase Admin SDK initialized with explicit credentials.");
      } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.stack);
      }
    }
    return {
        firestore: admin.firestore(),
        auth: admin.auth(),
        storage: admin.storage()
    }
}

export const { firestore, auth, storage } = getFirebaseAdmin();
