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

const CHART_COLORS = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)', 'rgb(0, 250, 192)', 'rgb(75, 192, 0)']


class Stats {
    constructor(ctx, data) {
        // let data = params.loadLocal(index)
        const dsColor = 'rgb(255, 99, 132)'


        let sensorValues = data.log
        let newSensorValues = new Array(sensorValues.length);
        let timeStamps = [];

        let index = 0;
        // construct new timeline 
        for (const [, subArray] of Object.entries(sensorValues)) {
            newSensorValues[index] = new Array()// create blank 2d array
            for (const [key,] of Object.entries(subArray)) {
                timeStamps.push(parseInt(key));
            }
            index++;
        }
        let timeIncrements = 100;
        let totalSteps = data.duration / timeIncrements;
        for (let i = 0; i < totalSteps; i++) {
            timeStamps.push(i * timeIncrements);
        }
        timeStamps.sort(function (a, b) {
            return a - b;
        });


        // reconstruct array. 

        for (let i = 0; i < timeStamps.length; i++) {
            let index = 0;
            for (const [, subArray] of Object.entries(sensorValues)) {
                let newValue = 0;
                for (const [key, value] of Object.entries(subArray)) {
                    if (parseInt(key) == timeStamps[i]) {
                        newValue = value;
                    }
                }
                newSensorValues[index].push(newValue);
                index++;
            }
        }

        let noSensors = sensorValues.length

        let sensorDatasets = []
        for (let i = 0; i < noSensors; ++i) {

            sensorDatasets[i] = {
                label: 'channel ' + i + '',
                data: newSensorValues[i],
                pointStyle: 'dash',
                borderColor: CHART_COLORS[i],
                borderWidth: 1
            }
        }

        const totalDuration = 2000;
        const delayBetweenPoints = totalDuration / sensorValues[0].length;
        const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;

        let myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeStamps,
                datasets: sensorDatasets,
            },
            options: {
                maintainAspectRatio: false,
                interaction: {
                    intersect: false
                },
                plugins: {
                    legend: false
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}
export default Stats