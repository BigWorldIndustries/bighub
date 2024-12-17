import { json } from "@sveltejs/kit";
import { api, handlersForActions, updateStore, writableWithCache, type Actions, type Store } from "./util";
import { doc, getDoc, getFirestore, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "$lib/client/firebase/firebase.client";
import { PUBLIC_ELECTION_ID } from "$env/static/public";

interface VoteStore extends Store {
    electionData: ElectionData;
    offset: number;
}

export interface ElectionData {
    simvotes: SimVotes,
    sim_timestamp: string,
    regions: string[]
}

export interface SimVotes {
    [candidate: string]: VoteData
}

export interface VoteData {
    [region: string]: number
}

export const voteStore = writableWithCache<VoteStore>("voteStore", {
    lastAction: null,
    lastActionSuccess: null,
    errorMessage: null,
    electionData: { simvotes: {}, sim_timestamp: "", regions: [] },
    offset: 55
});

const actions: Actions<VoteStore> = {
    // getSimData: async (currentStore: VoteStore) => {

    //     let data: ElectionData = await api('GET', `/api/votes`);
    //     console.log(json(data));
    //     return { simData: data };
    // }
    getElectionData: async (currentStore: VoteStore) => {

        console.log('getElectionData');
        const docRef = doc(db, 'elections', PUBLIC_ELECTION_ID);

        // add a real-time listener for the firestore data
        onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                var data = docSnap.data() as ElectionData;
                updateStore(voteStore, { 
                    electionData: data,
                    offset: data.sim_timestamp != currentStore.electionData.sim_timestamp ? 0 : currentStore.offset
                });
            } else {
                console.error("No such document!");
            }
        });

        // get the current data
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            var data = docSnap.data() as ElectionData;
            return { 
                electionData: data,
                offset: data.sim_timestamp != currentStore.electionData.sim_timestamp ? 0 : currentStore.offset
            };
        }
        else {
            return {};
        }
    },

    incrementOffset: async (currentStore: VoteStore) => {
        return { offset: currentStore.offset + Math.floor(Math.random() * 10) };
    }
}

export const voteStoreHandlers = handlersForActions(voteStore, actions);