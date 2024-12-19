import { initializeFirebaseAdmin } from "$lib/server/firebase/firebase.server";
import { withErrorHandling } from "$lib/server/util/util.server";

import { PUBLIC_ELECTION_ID } from "$env/static/public";
import { json } from "@sveltejs/kit";

export const GET = withErrorHandling(async function(event) {
    const admin = initializeFirebaseAdmin();

    const db = admin.firestore();

    //const jobsQuery = db.collection('jobs').where('creator', '==', user.uid).orderBy('createTime', 'desc');
    //const jobsQuerySnapshot = await jobsQuery.get();

    const votesQuery = db.collection('elections').doc(PUBLIC_ELECTION_ID);
    const votesSnapshot = await votesQuery.get();
    const voteSimData = votesSnapshot.get('simvotes');

    console.log(voteSimData);
    return json(voteSimData);
});