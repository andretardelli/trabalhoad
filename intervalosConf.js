//Calcula intervalo de confianca para tempo medio de espera na fila usando t-student
function IC_tStudent( medidas ){
    
    var _media = media(medidas)
    alert("media ta dando " + _media )
    var _variancia = variancia(medidas)
    //valores de z(1-a/2) e z(a/2) tirado da tabela para a=0.05
    //z(1-a/2) = -z(a/2)    
    var z = 1.961;
    //define min e max varoles do intervalo
    var min = _media  - z * ( Math.sqrt(_variancia) / Math.sqrt(medidas.length) );
    var max = _media  + z * ( Math.sqrt(_variancia) / Math.sqrt(medidas.length) );
    
    return [min, max];
}

// Calcula intervalo de confianca  usando chi-quadrado 
// com 3200 graus de liberdade e confiança de 95%
function IC_chiSquare( medidas ){
    var _variancia = variancia(medidas)

    //Valores tabelados dos percentis de chiQuadrado para 2.5% e 97.5% 
    var q1 = 3045.1056;
    var q2 = 3358.6827;
    
    var min = _variancia*3200/q2;
    var max = _variancia*3200/q1    ;
    
    return [min, max];
}
