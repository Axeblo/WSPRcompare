
import dayjs from 'dayjs';

async function compare(A, B) {
    const result = await new Promise((resolve, reject) => {
        var stopwatch = performance.now();
        console.log("⏱ Compare started");
        const ID = 0
        const TIME = 1
        const BAND = 2
        const RX_SIGN = 3
        const RX_LAT = 4
        const RX_LON = 5
        const RX_LOC = 6
        const TX_SIGN = 7
        const TX_LAT = 8
        const TX_LON = 9
        const TX_LOC = 10
        const DISTANCE = 11
        const AZIMUTH = 12
        const RX_AZIMUTH = 13 
        const FREQUENCY = 14
        const POWER = 15
        const SNR = 16
        const DRIFT = 17
        const VERSION = 18
        const CODE = 19
        const SNRA = 20
        const SNRB = 21
        const DRIFTA = 22
        const DRIFTB = 23

        var outputDataTable = {
            meta: [
                { "name": "id",         "type": "UInt64"                  },
                { "name": "time",       "type": "DatTime"                },
                { "name": "band",       "type": "Int16"                  },
                { "name": "rx_sign",    "type": "LowCardinality(String)" },
                { "name": "rx_lat",     "type": "Float32"                },
                { "name": "rx_lon",     "type": "Float32"                },
                { "name": "rx_loc",     "type": "LowCardinality(String)" },
                { "name": "tx_sign",    "type": "LowCardinality(String)" },
                { "name": "tx_lat",     "type": "Float32"                },
                { "name": "tx_lon",     "type": "Float32"                },
                { "name": "tx_loc",     "type": "LowCardinality(String)" },
                { "name": "distance",   "type": "UInt16"                 },
                { "name": "azimuth",    "type": "UInt16"                 },
                { "name": "rx_azimuth", "type": "UInt16"                 },
                { "name": "frequency",  "type": "UInt32"                 },
                { "name": "∆power",     "type": "Int8"                   },
                { "name": "∆snr",       "type": "Int8"                   },
                { "name": "∆drift",     "type": "Int8"                   },
                { "name": "version",    "type": "LowCardinality(String)" },
                { "name": "code",       "type": "Int8"                   },
                { "name": "power_a",    "type": "Int8"                   },
                { "name": "power_b",    "type": "Int8"                   },
                { "name": "snr_a",      "type": "Int8"                   },
                { "name": "snr_b",      "type": "Int8"                   },
                { "name": "drift_a",    "type": "Int8"                   },
                { "name": "drift_b",    "type": "Int8"                   }
            ], data: []
        };

        if (A === undefined)
            reject("A undefined");

        if (B === undefined)
            reject("B undefined");

        if (A.data === undefined)
            reject("A.data undefined");

        if (B.data === undefined)
            reject("B.data undefined");
            
        if (!Array.isArray(A.data))
            reject("A.data is not an array");
            
        if (!Array.isArray(B.data))
            reject("B.data is not an array");

        var ACounter = 0;
        var BCounter = 0;

        var CommonTimeslotCounter = 0;

        while (ACounter < A.data.length && BCounter < B.data.length) {
            var ATime = dayjs(A.data[ACounter][TIME]);
            var BTime = dayjs(B.data[BCounter][TIME]);

            var loopCounter = 0;
            //Find first timeslot where both transmitters have spots
            while (!ATime.isSame(BTime) &&
                ACounter < A.data.length - 1 &&
                BCounter < B.data.length - 1) {
                ++loopCounter;

                while (ATime.isBefore(BTime) && ACounter < A.data.length - 1) {
                    ATime = dayjs(A.data[++ACounter][TIME]);
                }

                while (BTime.isBefore(ATime)  && BCounter < B.data.length - 1) {
                    BTime = dayjs(B.data[++BCounter][TIME]);
                }

                if (loopCounter > 1000000) {
                    console.log("Loop counter exceeded 1000000");
                    break;
                }
            }
            if (!ATime.isSame(BTime)) {
                //console.log("Reached end of data before finding common timeslot");
                break;
            }
            ++CommonTimeslotCounter
            //We have now found a common timeslot
            //After that, find out how many spots each transmitter has in that timeslot    

            var ACounterEnd = ACounter;
            var BCounterEnd = BCounter;

            var ATimeEnd = dayjs(ATime);
            var BTimeEnd = dayjs(BTime);
            while (ATimeEnd.isSame(ATime)) {
                ACounterEnd += 1;
                if (ACounterEnd >= A.data.length)
                    break;
                ATimeEnd = dayjs(A.data[ACounterEnd][TIME]);
            }

            while (BTimeEnd.isSame(BTime)) {
                BCounterEnd += 1;
                if (BCounterEnd >= B.data.length)
                    break;
                BTimeEnd = dayjs(B.data[BCounterEnd][TIME]);
            } 

            //We now have the number of spots for each transmitter in that timeslot
            //Extract subarray with data that is only in this timeslot for easier processing.

            var ATimeslotData = A.data.slice(ACounter, ACounterEnd);
            var BTimeslotData = B.data.slice(BCounter, BCounterEnd);

            //Both transmitter A and B has spots in timeslot k.
            //Find out if the same receiver has received both transmissions, if so, add to data
            for (var j = 0; j < ATimeslotData.length; ++j) {
                const found = BTimeslotData.find(recB => ATimeslotData[j][RX_SIGN] === recB[RX_SIGN]);
                if (found) {
                    outputDataTable.data.push(
                        [
                            outputDataTable.data.length,
                            ATimeslotData[j][TIME],
                            ATimeslotData[j][BAND],
                            ATimeslotData[j][RX_SIGN],
                            ATimeslotData[j][RX_LAT],
                            ATimeslotData[j][RX_LON],
                            ATimeslotData[j][RX_LOC],
                            ATimeslotData[j][TX_SIGN],
                            ATimeslotData[j][TX_LAT],
                            ATimeslotData[j][TX_LON],
                            ATimeslotData[j][TX_LOC],
                            ATimeslotData[j][DISTANCE],
                            ATimeslotData[j][AZIMUTH],
                            ATimeslotData[j][RX_AZIMUTH],
                            ATimeslotData[j][FREQUENCY],
                            ATimeslotData[j][POWER] - found[POWER],
                            ATimeslotData[j][SNR]   - found[SNR],
                            ATimeslotData[j][DRIFT] - found[DRIFT],
                            ATimeslotData[j][VERSION] + " AND " + found[VERSION],
                            ATimeslotData[j][CODE],
                            ATimeslotData[j][POWER], //power_a
                            found[POWER],            //power_b
                            ATimeslotData[j][SNR],   //snr_a
                            found[SNR],              //snr_b
                            ATimeslotData[j][DRIFT], //drift_a
                            found[DRIFT]             //drift_b
                        ]
                    );
                }
            }
            ACounter = ACounterEnd;
            BCounter = BCounterEnd;
        }
        console.log("🛑 Stopwatch took " + (performance.now()-stopwatch) + "ms")
        resolve(outputDataTable);
    });
    return result;
}

export default compare;
