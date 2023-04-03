
import dayjs from 'dayjs';

async function compare(A, B, start, stop) {
    const result = await new Promise((resolve, reject) => {
        setTimeout(() => {
        var data = {
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
                    data.data.push(["" + timeslotDataA[j][0] + "+" + found[0],
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
        }
        resolve(data);
    }, 1000);
    });
    return result;
}

export default compare;