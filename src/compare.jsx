
import dayjs from 'dayjs';

async function compare(A, B, start, stop) {
    const result = await new Promise((resolve, reject) => {
        var outputDataTable = {
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
                { "name": "power" },
                { "name": "∆snr" },
                { "name": "snrA" },
                { "name": "snrB" },
                { "name": "driftA" },
                { "name": "driftB" }
            ], data: []
        };

        var ACounter = 0;
        var BCounter = 0;
        while( ACounter < A.data.length && BCounter < B.data.length ) {
            var ATime = dayjs(A.data[ACounter][1]);
            var BTime = dayjs(B.data[BCounter][1]);

            var loopCounter = 0;
            //Find first timeslot where both transmitters have receptions
            while( !ATime.isSame(BTime) &&
                ATime <= stop && BTime <= stop &&
                ACounter < A.data.length-1 &&
                BCounter < B.data.length-1 ) {
                ++loopCounter;

                while( ATime.isBefore(BTime) && !ATime.isAfter(stop) && ACounter < A.data.length-1 ) {
                    ATime = dayjs(A.data[++ACounter][1]);
                }

                while( BTime.isBefore(ATime) && !BTime.isAfter(stop) && BCounter < B.data.length-1 ) {
                    BTime = dayjs(B.data[++BCounter][1]);
                }

                if( loopCounter > 100000 ) {
                    console.log("Loop counter exceeded 100000");
                    break;
                }
            }
            if( !ATime.isSame(BTime) ){
                console.log("Reached end of data before finding common timeslot");
                break;
            }

            if( ATime.isAfter(stop) || BTime.isAfter(stop) ){
                console.log("timeslot is after stop time");
                break;
            }

            //We have now found a common timeslot
            //After that, find out how many receptions each transmitter has in that timeslot    

            var ACounterEnd = ACounter;
            var BCounterEnd = BCounter;

            var ATimeEnd = dayjs(ATime);
            var BTimeEnd = dayjs(BTime);
            do {
                ACounterEnd += 1;
                if( ACounterEnd >= A.data.length )
                    break;
                ATimeEnd = dayjs(A.data[ACounterEnd][1]);
            } while( ATimeEnd.isSame(ATime) )

            do {
                BCounterEnd += 1;
                if( BCounterEnd >= B.data.length )
                    break;

                BTimeEnd = dayjs(B.data[BCounterEnd][1]);
            } while( BTimeEnd.isSame(BTime) )

            //We now have the number of receptions for each transmitter in that timeslot
            //Extract subarray with data that is only in this timeslot for easier processing.

            var ATimeslotData = A.data.slice(ACounter, ACounterEnd);
            var BTimeslotData = B.data.slice(BCounter, BCounterEnd);
                
            //Both transmitter A and B has receptions in timeslot k.
            //Find out if the same receiver has received both transmissions, if so, add to data
            for (var j = 0; j < ATimeslotData.length; ++j) {
                const found = BTimeslotData.find(recB => ATimeslotData[j][3] === recB[3]);
                if (found)
                outputDataTable.data.push(["" + ATimeslotData[j][0] + "+" + found[0],
                    ATimeslotData[j][1],
                    ATimeslotData[j][2],
                    ATimeslotData[j][3],
                    ATimeslotData[j][4],
                    ATimeslotData[j][5],
                    ATimeslotData[j][6],
                    ATimeslotData[j][7] + " + " + found[7],
                    ATimeslotData[j][8],
                    ATimeslotData[j][9],
                    ATimeslotData[j][10],
                    ATimeslotData[j][11],
                    ATimeslotData[j][12],
                    ATimeslotData[j][13],
                    ATimeslotData[j][14],
                    ATimeslotData[j][15],
                    ATimeslotData[j][16] - found[16],
                    ATimeslotData[j][16],
                    found[16],
                    ATimeslotData[j][17],
                    found[17]]);
            }
            ACounter = ACounterEnd;
            BCounter = BCounterEnd;
        }

        // console.log( outputDataTable );

        /*
        for (var i = start; i < stop; i = i.add(2, 'minutes')) {
    
            var timeslotDataA = A.data.filter(row => {
                return row[1] === dayjs(i).format("YYYY-MM-DD HH:mm:ss");
            });
            var timeslotDataB = B.data.filter(row => {
                return row[1] === dayjs(i).format("YYYY-MM-DD HH:mm:ss");
            });
    
            if (!timeslotDataA || !timeslotDataB) // No data for this timeslot, search next timeslot
                continue;
    
            //Both transmitter A and B has receptions in timeslot k.
            //Find out if the same receiver has received both transmissions, if so, add to data
            for (var j = 0; j < timeslotDataA.length; ++j) {
                const found = timeslotDataB.find(recB => timeslotDataA[j][3] === recB[3]);
                if (found)
                    outputDataTable.data.push(["" + timeslotDataA[j][0] + "+" + found[0],
                    timeslotDataA[j][1],
                    timeslotDataA[j][2],
                    timeslotDataA[j][3],
                    timeslotDataA[j][4],
                    timeslotDataA[j][5],
                    timeslotDataA[j][6],
                    timeslotDataA[j][7] + " + " + found[7],
                    timeslotDataA[j][8],
                    timeslotDataA[j][9],
                    timeslotDataA[j][10],
                    timeslotDataA[j][11],
                    timeslotDataA[j][12],
                    timeslotDataA[j][13],
                    timeslotDataA[j][14],
                    timeslotDataA[j][15],
                    timeslotDataA[j][16] - found[16],
                    timeslotDataA[j][16],
                    found[16],
                    timeslotDataA[j][17],
                    found[17]]);
            }
        }*/
        resolve(outputDataTable);
    });
    return result;
}

export default compare;
