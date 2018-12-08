    var color = Chart.helpers.color;
    var colorNames = Object.keys(window.chartColors);

    var tempoMedioPorRodadaData = {
        labels: [],
        datasets: [{
        }]
    };

    var numeroMedioPorRodadaData = {
        labels: [],
        datasets: [{
        }]
    };

    var taxaDeUtilizacaoPorRodadaData = {
        labels: [],
        datasets: [{
        }]
    };

function addDataToGraph(dataGrafico, nomeDataset, tipoGrafico ) {
    var colorName = colorNames[nomeDataset.datasets.length % colorNames.length];
    var dsColor = window.chartColors[colorName];
    var newDataset = {
        label: 'Rodada ' + (nomeDataset.datasets.length - 1),
        backgroundColor: color(dsColor).alpha(0.5).rgbString(),
        borderColor: dsColor,
        borderWidth: 1,
        data: [dataGrafico]
    };
    nomeDataset.datasets.push(newDataset);
    tipoGrafico.update();
};

window.onload = function() {
    var ctx = document.getElementById('graph1').getContext('2d');
    window.tempoMedioPorRodadaChart = new Chart(ctx, {
        type: 'bar',
        data: tempoMedioPorRodadaData,
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Tempo médio de pessoas por rodada'
            }
        }
    });

    var ctx2 = document.getElementById('graph2').getContext('2d');
    window.numeroMedioPorRodadaChart = new Chart(ctx2, {
        type: 'bar',
        data: numeroMedioPorRodadaData,
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Número médio de pessoas por rodada'
            }
        }
    });

    var ctx3 = document.getElementById('graph3').getContext('2d');
    window.taxaDeUtilizacaoPorRodadaChart = new Chart(ctx3, {
        type: 'bar',
        data: taxaDeUtilizacaoPorRodadaData,
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Taxa de Utilização por rodada'
            }
        }
    });

};