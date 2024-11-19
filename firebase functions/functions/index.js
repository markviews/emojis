const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();

//# add user to database on account creation
exports.addAccount = functions.auth.user().onCreate((user) => {
    const userId = user.uid;

    const userData = {
        emojis: []
    };
    
    return admin.firestore().collection("userdata").doc(userId).set(userData);
});

//# remove user from database on account deletion
exports.removeAccount = functions.auth.user().onDelete((user) => {
    const userId = user.uid;

    return admin.firestore().collection("userdata").doc(userId).delete();
});

//# add emojis
exports.addEmojis = functions.https.onCall((data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to reorder emojis');
    }

    const emojis = data.emojis;
    if (!Array.isArray(emojis) || emojis.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The "emojis" field must be a non-empty array.');
    }

    // Use arrayUnion to add multiple emojis at once
    const userId = context.auth?.uid;
    return admin.firestore().collection("userdata").doc(userId).update({
        emojis: admin.firestore.FieldValue.arrayUnion(...emojis) // Spread the array to add each emoji individually
    });
});

//# remove emojis
exports.removeEmojis = functions.https.onCall((data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to reorder emojis');
    }

    const emojisToRemove = data.emojis;
    if (!Array.isArray(emojisToRemove) || emojisToRemove.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The "emojis" field must be a non-empty array.');
    }

    const userId = context.auth?.uid;
    return admin.firestore().collection("userdata").doc(userId).update({
        emojis: admin.firestore.FieldValue.arrayRemove(...emojisToRemove)
    });
});

//# re-order emojis
exports.reorderEmojis = functions.https.onCall(async (data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to reorder emojis');
    }

    const newEmojiOrder = data.emojis;
    if (!Array.isArray(newEmojiOrder) || newEmojiOrder.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The "emojis" field must be a non-empty array.');
    }

    // Update the emojis array in Firestore for this user
    const userId = context.auth.uid;
    const userRef = admin.firestore().collection('userdata').doc(userId);
    try {
        await userRef.update({
            emojis: newEmojiOrder
        });
        return { message: 'Emojis reordered successfully' };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to reorder emojis');
    }

});

//# get emojis
exports.getEmojis = functions.https.onCall(async (data, context) => {

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to get emojis');
    }

    const userId = context.auth.uid;
    const userDoc = await admin.firestore().collection('userdata').doc(userId).get();

    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User data not found');
    }

    // Get the emojis array from the user's document
    const emojis = userDoc.data().emojis;

    return { emojis };
});
