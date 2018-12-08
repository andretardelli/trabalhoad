    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    var tempoMedioPorRodadaData = {
        labels: [],
        datasets: [{
            // backgroundColor: window.chartColors.grey,
            borderWidth: 1,
            lineTension: 0,
            data: []
        }]
    };

    var numeroMedioPorRodadaData = {
        labels: [],
        datasets: [{
            // backgroundColor: window.chartColors.red,
            borderWidth: 1,
            lineTension: 0,
            data: []
        }]
    };

    var taxaDeUtilizacaoPorRodadaData = {
        labels: [],
        datasets: [{
            // backgroundColor: window.chartColors.blue,
            borderWidth: 1,
            lineTension: 0,
            data: []
        }]
    };

function addDataToGraph(dataGrafico, nomeDataset, tipoGrafico ) {
    nomeDataset.datasets[0].data.push(dataGrafico);
    tipoGrafico.update();
};

window.onload = function() {
    var ctx = document.getElementById('graph1').getContext('2d');
    window.tempoMedioPorRodadaChart = new Chart(ctx, {
        type: 'scatter',
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
                text: 'Tempo médio de pessoas por rodada'
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