//Calcula intervalo de confianca para tempo medio de espera na fila usando t-student
function ICmedia(tempoMedioFila, rodadas, tempoVarianciaFila){
    //valores de z(1-a/2) e z(a/2) tirado da tabela para a=0.05
    //z(1-a/2) = -z(a/2)
    var z = 1.96;
    //define min e max varoles do intervalo
    var min = tempoMedioFila  - z*(Math.sqrt(tempoVarianciaFila)/Math.sqrt(rodadas));
    var max = tempoMedioFila  + z*(Math.sqrt(tempoVarianciaFila)/Math.sqrt(rodadas));
    return [min, max];
}

//Calcula intervalo de confianca para variancia do tempo de espera usando chi-quadrado com 3200 graus de liberdado
function ICvariancia(tempoMedioFila, rodadas, tempoVarianciaFila){
    //valores q(1-a/2) e q(a/2) tirados da tabela chi-quadrado para a=0.05
    var q1 = 3358.6827;
    var q2 = 3045.1056;
    //define min e max valores do intervalo
    var min = ((rodadas - 1)*tempoVarianciaFila)/q1;
    var max = ((rodadas - 1)*tempoVarianciaFila)/q2;
    return [min, max];
}
