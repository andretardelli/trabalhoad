    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

function addDataToGraph(dataGrafico, nomeDataset) {
    nomeDataset.datasets[0].data.push(dataGrafico);
    nomeDataset.datasets.push(dataGrafico);
    //tipoGrafico.update();
};

function addIC(tipoGrafico, icmin, icmax){
    if(tipoGrafico == window.tempoMedioPorRodadaChart){
        IcTempo[0] = icmin;
        IcTempomax[1] =  icmax;
    }
    if(tipoGrafico == window.numeroMedioPorRodadaChart){
        IcNum[0] = icmin;
        IcNummax[1] = icmax;
    }
    tipoGrafico.update();
};

//window.onload = function() {
function plotgraphs(tempoMedioPorRodadaData, numeroMedioPorRodadaData, taxaDeUtilizacaoPorRodadaData, contagemTotalData, IcTempo, IcNum){
    var ctx = document.getElementById('graph1').getContext('2d');
    console.log(IcTempo, IcNum);
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
                            min: 1.5, // minimum value
                            max: 2.5 // maximum value
                        }
               }]
            },
            annotation: {
                annotations: [{
                   type: 'box',
                   //drawTime: 'afterDatasetsDraw',
                   yScaleID: 'y-axis-0',
                   yMin: IcTempo[0],
                   yMax: IcTempo[1],
                   backgroundColor: 'rgba(0, 255, 0, 0.1)'
                }]
             }
        },
    });

    var ctx2 = document.getElementById('graph2').getContext('2d');
    window.numeroMedioPorRodadaChart = new Chart(ctx2, {
        type: 'line',
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
             },
            annotation: {
                annotations: [{
                type: 'box',
                //drawTime: 'beforeDatasetsDraw',
                yScaleID: 'y-axis-0',
                yMin: IcNum[0],
                yMax: IcNum[1],
                backgroundColor: 'rgba(0, 255, 0, 0.1)'
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

    var ctx4 = document.getElementById('graph4').getContext('2d');
    window.contagemTotalDataChart = new Chart(ctx4, {
        type: 'scatter',
        data: contagemTotalData,
        options: {
            responsive: true,
            showLines: true,
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Pessoas no Sistema'
            },
            scales: {
               yAxes: [{
                        ticks: {
                            min: 0, // minimum value
                        }
               }]
            }
        }
    });






};