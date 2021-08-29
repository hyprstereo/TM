import { Camera } from "../src/build/three.module";

const clips =
{
    start: [
        {
            '*iocScene': [{ state: 0 }],
            '*mediaManager': [{ 'screens': ['all', 'default'] }],
            '#tomi': [
                { '.position': { x: 0, y: 0, z: 0 } },

                { '.material': { opacity: 0 } }
            ]
            , 
            '#camera': [
                {
                    '.position': { x: 0, y: 0, z: 0 }
                }
            ]

        }
    ],
    sequences: {

    }
}