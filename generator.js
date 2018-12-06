
function iniciaFila(){

    var lambda = 0.1;
    var mi = 3;
    var numeroTotalColetas = 1000; // Variável, necessário para ter o IC de 95%
    var randomNumbersGenerator = new Random();
    
    var rodadaAtual = 0;
    var numeroTotalRodadas = 3200;
    
    for(lambda;lambda <= 0.9; lambda += 0.05)
    {
        lambda = Math.round(lambda * 10000) / 10000;
        
        for( ; rodadaAtual < numeroTotalRodadas; rodadaAtual++){
            //Início de uma rodada:
            var coletas = 0;
            var filaSimulacao = new Fila();

            while ( coletas <= numeroTotalColetas )
            {
                coletas ++;
            }
        }
    }
}
