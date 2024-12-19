import { json } from "@sveltejs/kit";
import { api, handlersForActions, updateStore, writableWithCache, type Actions, type Store } from "./util";
import { doc, getDoc, getFirestore, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "$lib/client/firebase/firebase.client";
import { PUBLIC_ELECTION_ID } from "$env/static/public";
import type { ConicStop } from "@skeletonlabs/skeleton";

interface VoteStore extends Store {
    electionData: ElectionData;
    offset: number;
    regionInfo: Regions,
    hoveredRegion: Region | null,
    regionImgUrls: RegionImgUrls
}

export interface ElectionData {
    simvotes: SimVotes,
    sim_timestamp: string,
    regions: string[],
    sim_conics: SimConics,
    sim_percents: SimPercents
}

export interface RegionImgUrls {
    [region: string]: string
}

export interface Region {
    name: string;
    faction: string;
    imgSrc: string;
    caption: string;
}

export interface Regions {
    [region: string]: Region
}

export interface SimConics {
    [region: string]: ConicStop[]
}

export interface SimPercents {
    [region: string]: CandidatePercents
}

export interface CandidatePercents {
    [candidate: string]: number
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
    electionData: { 
        simvotes: {}, 
        sim_timestamp: "", 
        regions: [], 
        sim_conics: {}, 
        sim_percents: {}
    },
    regionInfo: {},
    hoveredRegion: null,
    regionImgUrls: {},
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

            // pre-load image urls
            const regionImages: { [r: string]: string } = {};
            data.regions.forEach(region => {
                regionImages[region] = "/images/" + region.toLowerCase().replace(/\s/g, "_").replace("'", "") + ".jpg";
            });

            return { 
                electionData: data,
                regionImgUrls: regionImages,
                offset: data.sim_timestamp != currentStore.electionData.sim_timestamp ? 0 : currentStore.offset
            };
        }
        else {
            return {};
        }
    },

    incrementOffset: async (currentStore: VoteStore) => {
        return { offset: currentStore.offset + Math.floor(Math.random() * 10) };
    },

    selectRegion: async (currentStore: VoteStore, element: SVGElement) => {
        let region: Region | undefined = undefined;
        let latest_region_info = currentStore.regionInfo;
        
        const regionName = element.getAttribute('region') ?? '';
        if (latest_region_info[regionName]) {
            region = latest_region_info[regionName];
        }
        else {
            region = {
                name: element.getAttribute('region') ?? '',
                faction: element.getAttribute('faction') ?? '',
                caption: element.getAttribute('caption') ?? '',
                imgSrc: "/images/" + (element.getAttribute('region') as string)?.toLowerCase()?.replace(/\s/g, "_").replace("'", "") + ".jpg"
            }
            latest_region_info[regionName] = region;
        }

        return { region_info: latest_region_info, hoveredRegion: region };
    },

    unselectRegion: async (currentStore: VoteStore) => {
        return { hoveredRegion: null }
    }
}

export const voteStoreHandlers = handlersForActions(voteStore, actions);