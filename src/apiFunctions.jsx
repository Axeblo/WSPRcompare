import dayjs from 'dayjs';

async function getJSONWithParameters(TXSign, start, stop, band, numberOfEntries) {
    let startTimeAndDate = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    let stopTimeAndDate = dayjs(stop).format('YYYY-MM-DD HH:mm:ss');

    const url = "https://db1.wspr.live/?query=SELECT * FROM wspr.rx WHERE tx_sign = '" + TXSign + "' AND band = '" + band + "' AND time >= '" + startTimeAndDate + "' AND time <= '" + stopTimeAndDate + "' LIMIT " + numberOfEntries + " FORMAT JSONCompact";

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data;
        });
}

export default getJSONWithParameters;