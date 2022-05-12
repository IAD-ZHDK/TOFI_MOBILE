import {
    Chart,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
} from 'chart.js';


Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip
);


import { msToM_S, msToM_S_MS } from './views/viewUtils/MathUtils'
import { getColorPallet } from "./utils/colorPalette.js";
const ons = require('onsenui')

const CHART_COLORS = getColorPallet();


class Stats {
    constructor(ctx, data) {
        let touchCount = 0;
        const dsColor = 'rgb(255, 99, 132)'

        let maxPower = 0;
        let sensorValues = data.log
        console.log(sensorValues);
        let newSensorValues = [];
        let chanelNumbers = [];
        let timeStamps = [];
        let i = 0;
        for (const [key, subArray] of Object.entries(sensorValues)) {
            if (typeof key !== 'undefined') {
                chanelNumbers.push(key)
                newSensorValues.push(new Array())
                let lastValue = 0;
                for (const [key, value] of Object.entries(subArray)) {
                    let keyInt = parseInt(key);
                    let formated = msToM_S_MS(keyInt);
                    newSensorValues[i].push(new Array(formated, value))
                    // track max power 
                    if (value > maxPower) {
                        maxPower = value
                    }
                    // count peaks
                    if (value <= 10 && lastValue > 0) {
                        touchCount++;
                        lastValue = 0
                    }
                    if (value >= 50) {
                        lastValue = value;
                    }
                    timeStamps.push(keyInt);
                }
                i++;
            }
        }
        timeStamps = [...new Set(timeStamps)];
        timeStamps.sort(function (a, b) {
            return a - b;
        });
        for (let i = 0; i < timeStamps.length; i++) {
            timeStamps[i] = msToM_S_MS(timeStamps[i]);
        }


        let noSensors = newSensorValues.length

        let sensorDatasets = []
        for (let i = 0; i < noSensors; ++i) {

            sensorDatasets[i] = {
                label: 'sensor no: ' + chanelNumbers[i] + '',
                data: newSensorValues[i],
                pointRadius: 0,
                borderColor: CHART_COLORS[chanelNumbers[i]],
                borderWidth: 1
            }
        }

        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeStamps,
                datasets: sensorDatasets,
            },
            options: {
                grid: {
                    labels: {
                        fontColor: 'white'
                    }
                },
                maintainAspectRatio: false,
                interaction: {
                    intersect: false
                },
                plugins: {
                    legend: false
                },
                responsive: true,
                scales: {
                    x: {
                        ticks: {
                            color: 'white',
                            // min: 0
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white',
                            //  min: 0
                        }
                    }
                }
            }
        });

        let timeFormated = msToM_S(data.duration)

        const trainingDuration = ons.createElement(`<p style="text-align: left;"">Total Duration: <b> ` + timeFormated + ` minutes </b> </p>`)
        ctx.parentNode.insertBefore(trainingDuration, ctx.parentNode.firstChild);
        const totalTouches = ons.createElement(`<p style="text-align: left;"">Total Touches: <b> ` + touchCount + ` </b> </p>`)
        ctx.parentNode.insertBefore(totalTouches, ctx.parentNode.firstChild);
        const maxForce = ons.createElement(`<p style="text-align: left;"">Maximum Force: <b> ` + maxPower + ` % </b> </p>`)
        ctx.parentNode.insertBefore(maxForce, ctx.parentNode.firstChild);
    }
}
export default Stats