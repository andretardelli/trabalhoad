
function iniciaFila(){

    var lambda = 0.1;
    var mi = 3;
    var tempo = 10000;
    var rodadas = 10;
    var randomNumbersGenerator = new Random();
    var numeroRodadas = 1;

    for(lambda;lambda <= 0.9; lambda += 0.05)
    {
        lambda = Math.round(lambda * 10000) / 10000;
        
        for(numeroRodadas; numeroRodadas <= rodadas; numeroRodadas++){
            //cada rodada, ele insere os respectivos contadores
            var tempoSimulacao = 0;
            var filaSimulacao = new Fila();
            var numeroPessoas = 0;
            var pessoasServidas = 0;

            var tempoChegada = randomNumbersGenerator.exponential(lambda);
            var tempoTotal = tempo;
            var tempoUltimoEvento = 0;

            tempoChegada = randomNumbersGenerator.exponential(lambda); 
            
            filaSimulacao.push(new atribuiEvento("Chegada",tempoChegada));

            while (tempoSimulacao <= tempo && !filaSimulacao.emptyQueue())
            {
                //retira o primeiro elemento da fila de eventos
                 var evento = filaSimulacao.pop();

                 if (evento.type === "Chegada")
                 {
                     tempoSimulacao = tempoChegada;

                     numeroPessoas++;
                     tempoUltimoEvento = tempoSimulacao;
                     tempoChegada = tempoSimulacao + randomNumbersGenerator.exponential(lambda);
                     filaSimulacao.push(new atribuiEvento("Chegada", tempoChegada));
                     $('#message').prepend("<p>" + "Chegada", tempoTotal + "</p>")
                     //agenda a proxima chegada na fila de eventos
     
                     if (numeroPessoas === 1) //se só tiver uma pessoa na fila de eventos, ele agenda a proxima partida
                     {
                         tempoTotal = tempoSimulacao + randomNumbersGenerator.exponential(mi);
                         filaSimulacao.push(new atribuiEvento("Partida", tempoTotal));
                         $('#message').prepend("<p>" + "Partida", tempoTotal + "</p>")
                     }
                 }

                 else if (evento.type === "Partida")  //se for um evento de partida, calculo contadores
                 {
                    tempoSimulacao = tempoTotal;
                    numeroPessoas--;
                    tempoUltimoEvento = tempoSimulacao;
                    pessoasServidas++;
     
                     if (numeroPessoas > 0)  //se após essa partida ainda houver pessoas, uma nova partida é agendada
                     {
                        tempoTotal = tempoSimulacao + randomNumbersGenerator.exponential(mi);
                        filaSimulacao.push(new atribuiEvento("Partida", tempoTotal));
                        $('#message').prepend("<p>" + "Partida", tempoTotal + "</p>")
                     }
                 }
            }
        }
    }
}
