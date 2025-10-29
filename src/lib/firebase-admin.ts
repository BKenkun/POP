
import admin from 'firebase-admin';

// This configuration uses the service account details you provided,
// ensuring the server-side Admin SDK can always authenticate correctly.
const serviceAccount = {
  "type": "service_account",
  "project_id": "purorush",
  "***REMOVED***_id": "6ef3fe1689bf7a6a2c32889f18dd30601c4c26b0",
  "***REMOVED***": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCamR18ECh4MEfH\nXV9YE9QZiAuLCRC9b6FjLHYtQk6VjntPmoFZ4Nas+xbp507K/8pEAzhTPshW1oMN\nxS5UyJwuYKici33Onk9rhNKK42D6c1IrAlZHys8+oEMikuZxWQSgS07+TVZw6noh\nFLIOcIEf0eI7ksZZvonu2Qnxdq7c8sp4zF770BzYpGhrrQ1q5PH0jFKeZjITnUc5\nzIe+mCej6X8O42jUUWSXu2Z6r8vgBu4K36JOJ2Hy8zybAzo5okZc3mTJcRCSJcQF\nKlbFoOTTuumGXd0HfEK7c45dPdduTBwkrutnAmjmAUyG27Se7WIeQeW7/cuaeTfN\ncXGRaZvBAgMBAAECggEACI16NLn5nS2RmQFMxCUDrb5pohFYMly1vVRxPL9/dLVn\nU7/w0kG2qqbw7XOBF8inHlRdxjgx0eEH6sf68FCRWFz7Uv7CEN9P9jsowSuDWtOs\nqum0D4B0Lusjj6r4EfL6ZypHZljttG06YLBiCdu2PwYH2aMc80vP2m16J/g4hAtZ\n+My36HGuT0HwtNaOShFz12B6045jb3YkCoWzFyYF5ATbStn9duoR4j39Y/J60Nhc\nPpMHIhgqak7UcXnkTSPF68a8psjfNrgBEBYhhDzQffybjC6ryorTHvuZDKf6mJ7H\nGr81Mj/X7pv+VVRDn6vaHSzzumNylKfhD8En9IXB2QKBgQDQBQP+evdLQt+5OZBx\nQC/HoaRxwttoRbwWyrB4/HK7NTHN2IPPswKYNFtCGimsJM/DUDbbEurNx+zkFanL\nKOLGsol1QfML/q2REWhaQ1CfsRGbmhiVpxWLl0s0HFLX2mfEavfFPxgA1+ptdWmz\nzBDCgOhlX1g9TRoIEaG14He2KQKBgQC+QbU1sbpuJ6nEdKsSRLo85akaEw0/OBiQ\nUVTEF367U2InjiM0oCmTUsPXPd+FsYweysYsCvsoyH/xQIJFJfFn4mtJ0YGH4ACq\nWEOdx4NUjQjsbWpyfpZGvv7XXyCpINOee3X2uAZayLH8EwSv2V5LJbLmCmSdqT7D\nBbtmmGb72QKBgAcsZRrderGpuLVWetis8fjcZiNWKOLLpNTUYImLixlRmEoU8Va0\nQZ6mD4+T/2PkURXXKk0bteUqw8yJwrUyz78yYPMeNxduzOV3yDV0pM8c+BJ5medv\nP5r0uK8vWtv+uB1Z4vl2V4mP6JGlvuNoYhuS/nCgfRaAFim5Ee6HsxkhAoGAYHBm\nLmV8nsG0KEULQiNcU+oGIZVurZD9wom3cf6G2uWVZ3+BEPfumyLk6oIOf3JUGHeo\npEKctTuMvvl4Dx0AlSwMPkrYYcuGCtLa02uCgqVK1K1Ru9+2xP2jqAAsSg69tiPW\n08zMS9BXh/ML+ScxyN2/JSQ3hEN58NlC+OpfqWECgYBW2sjw8RmkU3wH9j1Vfmo2\nFj7NpMSEbkvpXiwpM71A8tuayoNvFJd1J6+CcbqQDCKkWeucFbErknCX75xTUqh/\neFmF8/WSzl3yqPUoX7cXcFQJyabAOxFsNSdKsziI3wjpFewgtLzlW3iLWmIAuTMW\n8mXi6bUn8jN3Zvz/2c7+Rg==\n-----END PRIVATE KEY-----\n",
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
