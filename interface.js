    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    var N = 320; 
    var labelsize = [];
    //console.log(Array.apply(null, {length: N+1}).map(Number.call, Number));

    var tempoMedioPorRodadaData = {
        labels: Array.apply(null, {length: N+1}).map(Number.call, Number),
        datasets: [{
            // backgroundColor: window.chartColors.red,
            borderWidth: 1,
            lineTension: 0,
            radius: 0,
            data: []
        }],
        yHighlightRange:{
        }
    };

    var numeroMedioPorRodadaData = {
        labels: [],
        datasets: [{
            // backgroundColor: window.chartColors.red,
            borderWidth: 1,
            lineTension: 0,
            radius: 0,
            data: []
        }],
        yHighlightRange:{
        }
    };

    var taxaDeUtilizacaoPorRodadaData = {
        labels: [],
        datasets: [{
            // backgroundColor: window.chartColors.blue,
            borderWidth: 1,
            lineTension: 0,
            radius: 0,
            data: []
        }],
        yHighlightRange:{
        }
    };
    // The original draw function for the line chart. This will be applied after we have drawn our highlight range (as a rectangle behind the line chart).
    var originalLineDraw = Chart.controllers.line.prototype.draw;
    // Extend the line chart, in order to override the draw function.
    Chart.helpers.extend(Chart.controllers.line.prototype, {
    draw : function() {
        var chart = this.chart;
        // Get the object that determines the region to highlight.
        var yHighlightRange = chart.config.data.yHighlightRange;
        // If the object exists.
        if (yHighlightRange !== undefined) {
        var ctx = chart.chart.ctx;
        var yRangeBegin = yHighlightRange.begin;
        var yRangeEnd = yHighlightRange.end;
        var xaxis = chart.scales['x-axis-0'];
        var yaxis = chart.scales['y-axis-0'];
        var yRangeBeginPixel = yaxis.getPixelForValue(yRangeBegin);
        var yRangeEndPixel = yaxis.getPixelForValue(yRangeEnd);
        ctx.save();
        // The fill style of the rectangle we are about to fill.
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        // Fill the rectangle that represents the highlight region. The parameters are the closest-to-starting-point pixel's x-coordinate,
        // the closest-to-starting-point pixel's y-coordinate, the width of the rectangle in pixels, and the height of the rectangle in pixels, respectively.
        ctx.fillRect(xaxis.left, Math.min(yRangeBeginPixel, yRangeEndPixel), xaxis.right - xaxis.left, Math.max(yRangeBeginPixel, yRangeEndPixel) - Math.min(yRangeBeginPixel, yRangeEndPixel));
        ctx.restore();
        }
        // Apply the original draw function for the line chart.
        originalLineDraw.apply(this, arguments);
    }
    });

function addDataToGraph(dataGrafico, nomeDataset, tipoGrafico) {
    nomeDataset.datasets[0].data.push(dataGrafico);
    nomeDataset.datasets.push(dataGrafico);
    tipoGrafico.update();
};

function addIC(nomeDataset, tipoGrafico, icmin, icmax){
    nomeDataset.yHighlightRange = {
        begin: icmin,
        end: icmax
    }
    tipoGrafico.update();
};

window.onload = function() {
    var ctx = document.getElementById('graph1').getContext('2d');
    window.tempoMedioPorRodadaChart = new Chart(ctx, {
        type: 'line',
        data: tempoMedioPorRodadaData,
        options: {
            responsive: true,
            showLines: true,
            lineTension: 0,
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Tempo Médio de Espera por Rodada'
            },
            scales: {
               yAxes: [{
                        ticks: {
                            min: 1, // minimum value
                            max: 3 // maximum value
                        }
               }]
            }
        }
    });

    var ctx2 = document.getElementById('graph2').getContext('2d');
    window.numeroMedioPorRodadaChart = new Chart(ctx2, {
        type: 'scatter',
        data: numeroMedioPorRodadaData,
        options: {
            responsive: true,
            showLines: true,
            lineTension: 0,
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Número médio de pessoas por rodada'
            },
            scales: {
                yAxes: [{
                         ticks: {
                             min: 0 // minimum value
                         }
                }]
             }
        }
    });

    var ctx3 = document.getElementById('graph3').getContext('2d');
    window.taxaDeUtilizacaoPorRodadaChart = new Chart(ctx3, {
        type: 'scatter',
        data: taxaDeUtilizacaoPorRodadaData,
        options: {
            responsive: true,
            showLines: true,
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Taxa de Utilização por rodada'
            },
            scales: {
               yAxes: [{
                        ticks: {
                            min: 0, // minimum value
                            max: 1 // maximum value
                        }
               }]
            }
        }
    });

};