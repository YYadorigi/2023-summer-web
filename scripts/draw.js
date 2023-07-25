// import index.js
import { canvas, ctx, dataInputTable, drawChartBtn, histogramChoice, curveChoice } from './index.js';

// Axes position, relative to the canvas
const xAxisLeftPostion = [50, canvas.height - 50];
const xAxisRightPostion = [canvas.width - 50, canvas.height - 50];
const yAxisTopPostion = [50, 50];
const yAxisBottomPostion = [50, canvas.height - 50];

// Axes length
const xAxisLength = xAxisRightPostion[0] - xAxisLeftPostion[0];
const yAxisLength = yAxisBottomPostion[1] - yAxisTopPostion[1];

// Chart height bound, preventing the chart from exceeding the canvas
const chartMaxHeight = yAxisLength - 50;

// Number of ticks on the Y-axis
const numberOfTicks = 6; 
const yTickOffset = 10;

// Point radius
const pointRadius = 5; 

const barTextSpacing = 5; // Spacing between the bar and the hovering value
const xTickLineHeight = 15; // X-axis tick text line height
const barCurveSpacing = 60; // Spacing between the bar and the curve

const barColor = '#4693E0';
const curveColor = '#39C5BB'; // The representative color of YOU-KNOW-WHO

/// Draw the chart
drawChartBtn.addEventListener('click', drawChart);

/// Rerennder the chart when the settings are changed
histogramChoice.addEventListener('change', drawChart);
curveChoice.addEventListener('change', drawChart);

/// Draw the chart
function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get data from table
    const dataRows = dataInputTable.getElementsByClassName('dataRow');
    const data = [];

    for (const row of dataRows) {
        const year = row.querySelector('.year').value;
        const yieldInput = row.querySelector('.yield').value;
        if (year === '' || yieldInput === '') {
            continue;
        } else {
            data.push([Number(year), Number(yieldInput)]);
        }
    }

    // Bar width adaptive to the number of data, and the relevant constants
    const numberOfBars = data.length;
    const barWidth = xAxisLength / (0.2 + numberOfBars * 1.8);
    const xTickSpacing = 0.8 * barWidth;    // Spacing between each tick on the X-axis
    const xAxisChartSpacing = 0.5 * barWidth;   // Spacing between the first & last bar and the chart border

    // Maximum statistics
    const yieldSum = data.reduce((sum, d) => sum + d[1], 0);
    const maxYield = Math.max(...data.map(d => d[1]));

    // Draw axes and Y-ticks
    setCtxStyle();
    drawAxes();
    // The value gap between each tick
    const tickUnit = Math.ceil(maxYield / numberOfTicks);
    // The distance between each tick in pixels
    const tickSpacing = chartMaxHeight / numberOfTicks;
    const barHeightPerUnit = tickSpacing / tickUnit;
    for (let i = 0; i <= numberOfTicks; i++) {
        const pointY = xAxisLeftPostion[1] - i * tickSpacing;
        ctx.fillText((i * tickUnit).toString(), xAxisLeftPostion[0] - yTickOffset, pointY);
    }

    // Draw the histogram
    if (histogramChoice.checked) {
        for (let i = 0; i < data.length; i++) {
            const year = data[i][0];
            const yieldInput = data[i][1];

            const pointX = xAxisLeftPostion[0] + xAxisChartSpacing + i * (xTickSpacing + barWidth);
            const pointY = xAxisLeftPostion[1];
            const barHeight = yieldInput * barHeightPerUnit;

            // Draw the bar
            ctx.fillStyle = barColor;
            ctx.fillRect(pointX, pointY, barWidth, -barHeight);

            // Draw the value and year
            setCtxStyle('black', '14px Arial', 'center');
            // Show the value
            ctx.fillText(yieldInput, pointX + barWidth / 2, pointY - barHeight - barTextSpacing);
            // Show the year
            ctx.fillText(year, pointX + barWidth / 2, pointY + xTickLineHeight);
        }
    }

    // Draw the curve
    if (curveChoice.checked) {
        for (let i = 0; i < data.length; i++) {
            const yieldInput = data[i][1];
            const yieldRatio = yieldInput / yieldSum;

            const pointX = xAxisLeftPostion[0] + xAxisChartSpacing + i * (xTickSpacing + barWidth) + barWidth / 2;
            const pointY = xAxisLeftPostion[1] - yieldInput * barHeightPerUnit - barCurveSpacing;

            // Draw the point
            drawSolidCircle(pointX, pointY, pointRadius, curveColor);

            // Show the value in the form of ratio
            setCtxStyle('black', '14px Arial', 'center');
            ctx.fillText((yieldRatio * 100).toFixed(0) + '%', pointX, pointY - pointRadius - xTickLineHeight / 2);
        }

        ctx.beginPath();
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 2;
        for (let i = 0; i < data.length; i++) {
            const yieldInput = data[i][1];

            const pointX = xAxisLeftPostion[0] + xAxisChartSpacing + i * (xTickSpacing + barWidth) + barWidth / 2;
            const pointY = xAxisLeftPostion[1] - yieldInput * barHeightPerUnit - barCurveSpacing;

            if (i === 0) {
                ctx.moveTo(pointX, pointY);
            } else {
                ctx.lineTo(pointX, pointY);
            }
        }
        ctx.stroke();
    } 
}

function setCtxStyle(fillStyle='black', font='14px Arial', textAlign='right') {
    ctx.fillStyle = fillStyle;
    ctx.font = font;
    ctx.textAlign = textAlign;
}

function drawAxes() {
    // Set the color and width of axes
    setCtxStyle();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 2;

    // Draw X-axis
    ctx.beginPath();
    ctx.moveTo(xAxisLeftPostion[0], xAxisRightPostion[1]);
    ctx.lineTo(xAxisRightPostion[0], xAxisRightPostion[1]);
    // Add arrow
    ctx.lineTo(xAxisRightPostion[0] - 5, xAxisRightPostion[1] - 5); 
    ctx.moveTo(xAxisRightPostion[0], xAxisRightPostion[1]);
    ctx.lineTo(xAxisRightPostion[0] - 5, xAxisRightPostion[1] + 5); 
    ctx.stroke();

    // Draw Y-axis
    ctx.beginPath();
    ctx.moveTo(yAxisBottomPostion[0], yAxisBottomPostion[1]);
    ctx.lineTo(yAxisTopPostion[0], yAxisTopPostion[1]);
    // Add arrow
    ctx.lineTo(yAxisTopPostion[0] - 5, yAxisTopPostion[1] + 5);
    ctx.moveTo(yAxisTopPostion[0], yAxisTopPostion[1]);
    ctx.lineTo(yAxisTopPostion[0] + 5, yAxisTopPostion[1] + 5);
    ctx.stroke();

    // Draw the labels of axes
    const yieldInfo = "产量\n（万吨）"; // TODO: How to make line break?
    ctx.fillText(yieldInfo, yAxisTopPostion[0] + 50, yAxisTopPostion[1] - 20);
    const yearInfo = "年份";
    ctx.fillText(yearInfo, xAxisRightPostion[0] + 40, xAxisRightPostion[1] + 10);
}

/// Draw a solid circle
function drawSolidCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}