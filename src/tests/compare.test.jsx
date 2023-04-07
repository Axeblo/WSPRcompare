import { expect, describe, it, test } from 'vitest'
import compare from '../compare'



const A = {
    data: [
        [
            0,                     //id
            "2023-03-25 23:28:00", //time
            10,                    //band
            "TA4/G8SCU",           //rx_sign
            36.604,                //rx_lat
            31.792,                //rx_lon
            "KM56vo",              //rx_loc
            "HB9T",                //tx_sign
            46.479,                //tx_lat
            6.958,                 //tx_lon
            "JN36",                //tx_loc
            2326,                  //distance
            109,                   //azimuth
            305,                   //rx_azimuth
            10140229,              //frequency
            23,                    //power
            -24,                   //snr
            0,                     //drift
            "SparkSDR",            //version
            1                      //code
        ]                    
    ]
}
const B = {
    data: [
        [
            0,                     //id
            "2023-03-25 23:28:00", //time
            10,                    //band
            "TA4/G8SCU",           //rx_sign
            36.604,                //rx_lat
            31.792,                //rx_lon
            "KM56vo",              //rx_loc
            "HB9T",                //tx_sign
            46.479,                //tx_lat
            6.958,                 //tx_lon
            "JN36",                //tx_loc
            2326,                  //distance
            109,                   //azimuth
            305,                   //rx_azimuth
            10140229,              //frequency
            23,                    //power
            -24,                   //snr
            0,                     //drift
            "SparkSDR",            //version
            1                      //code
        ]                    
    ]
}
const C = {
    meta: [
        { "name": "id" },
        { "name": "time" },
        { "name": "band" },
        { "name": "rx_sign" },
        { "name": "rx_lat" },
        { "name": "rx_lon" },
        { "name": "rx_loc" },
        { "name": "tx_sign" },
        { "name": "tx_lat" },
        { "name": "tx_lon" },
        { "name": "tx_loc" },
        { "name": "distance" },
        { "name": "azimuth" },
        { "name": "rx_azimuth" },
        { "name": "frequency" },
        { "name": "∆power" },
        { "name": "∆snr" },
        { "name": "∆drift" },
        { "name": "version" },
        { "name": "code" },
        { "name": "power_a" },
        { "name": "power_b" },
        { "name": "snr_a" },
        { "name": "snr_b" },
        { "name": "drift_a" },
        { "name": "drift_b" }
    ],
    data: [
        [ 
            0,                      //id
            "2023-03-25 23:28:00",  //time
            10,                     //band
            "TA4/G8SCU",            //rx_sign
            36.604,                 //rx_lat
            31.792,                 //rx_lon
            "KM56vo",               //rx_loc
            "HB9T",                 //tx_sign
            46.479,                 //tx_lat
            6.958,                  //tx_lon
            "JN36",                 //tx_loc
            2326,                   //distance
            109,                    //azimuth
            305,                    //rx_azimuth
            10140229,               //frequency
            0,                      //Δpower
            0,                      //Δsnr
            0,                      //Δdrift
            "SparkSDR AND SparkSDR",//version
            1,                      //code
            23,                     //power_a
            23,                     //power_b
            -24,                    //snr_a
            -24,                    //snr_b
            0,                      //drift_a
            0,                      //drift_b
        ]                    
    ]
}

test( '🤓' , async ()=>{
    await expect(compare(A,B)).resolves.toEqual(C);
})
