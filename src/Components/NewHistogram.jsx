import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3'

function NewHistogram({dataset}) {
    const ref = useRef();
    return (
        <svg viewBox="0 0 100 50" ref={ref}>
        </svg>
    )
}

export default NewHistogram;