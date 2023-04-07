import dayjs          from 'dayjs';
import dayjsPluginUTC from 'dayjs-plugin-utc'
dayjs.extend(dayjsPluginUTC)

async function getJSONWithParameters(TXSign, start, stop, band, numberOfEntries) {
    const startTime = performance.now();
    console.log("⏱ started");

    let startTimeAndDate = start.utc().format('YYYY-MM-DD HH:mm:ss');
    let stopTimeAndDate = stop.utc().format('YYYY-MM-DD HH:mm:ss');

    const url = "https://db1.wspr.live/?query=SELECT * FROM wspr.rx WHERE tx_sign = '" + TXSign + "' AND band = '" + band + "' AND time >= '" + startTimeAndDate + "' AND time <= '" + stopTimeAndDate + "' ORDER BY time LIMIT " + numberOfEntries + " FORMAT JSONCompact";

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(`🛑 Stopwatch took ${performance.now()-startTime}ms`)
            return data;
        });
}

export default getJSONWithParameters;