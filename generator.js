function simulacaoCompleta( seed = null /* Se null, usa Date.getTime() */ ){
    //var     disciplinas = [ "FCFS" , "LCFS" ]
    //var     taxas_de_utilizacao = [ 0.2 , 0.4 , 0.6 , 0.8 , 0.9 ]
    var     disciplina = $("#discipline").val();
    // var     taxas_de_utilizacao = [ 0.9 ];
    var taxa_de_utilizacao = $("#taxaUtilizacao").val();
    
    //Usamos o mesmo gerador para todas as filas
    var gerador = new geradorAleatorio( seed );

    // for( var d in disciplinas ){
        // for( var t in taxas_de_utilizacao ){
            // iniciaFila( taxas_de_utilizacao[t] , disciplinas[d] , gerador );
            iniciaFila( taxa_de_utilizacao , disciplina , gerador );
        // }
    // }
}

function iniciaFila( taxa_de_utilizacao , disciplina_de_atendimento , gerador ){
    const   lambda = 0.50               // TO-DO: usar formula pra pegar lambda
    const   mi = $("#mu").val();                   // Constante 1 pelo enunciado
    const   numeroMinimoDeColetas = 5000 // Falta calcular aí, não sei se pode ser arbitrário ou w/e, ler slide de IC kkkkk    
    const   numeroTotalRodadas = 320
    var     fila = new Fila( disciplina_de_atendimento )
    
    // Variáveis de controle:
    var     rodadaAtual = -1            // Ao término da fase transiente, muda para 0
    var     entrantesPosTransiente = 0  // Quantos entraram pós fase transiente
    var     saintesPosTransiente = 0    // Quantos sairam pós fase transiente
    var     emFaseTransiente = true     //Inicialmente em fase transiente
    var     tempoFimTransiente
    var     coletasEmFaseTransiente = []    //Usaremos no critério de fim da fase transiente
    var     varianciaFaseTransiente = null  //Usaremos no critério de fim da fase transiente
    var     coletasPorRodada = []       //Numero de entradas em cada rodada, inicialmente tudo 0.
    var     proximaChegada = gerador.exponential( lambda )   // Agendamos a primeira chegada
    var     proximaSaida = proximaChegada + gerador.exponential( mi )  // Já podemos agendar a primeira saida
    var     eventoAtual = proximaChegada        // Momento do proximo evento. Inicialmente será o momento da proxima chegada

    // Variáveis coletadas      
    var     pessoasPorRodada = []       // É um vetor de pessoas para cada rodada. Cada pessoa tem os dados que usaremos no fim.
    var     tempoPorRodada = []         // Duracao de cada rodada
    var     tempoOciosoPorRodada = [] 
    var     areaPorRodada = []          // Area do grafico (pessoas x tempo), separado por rodadas
    
    // Inicializa variaveis iniciais (vazias)
    for( i = 0 ; i < numeroTotalRodadas ; i++ ){
        coletasPorRodada[i] = 0;
        pessoasPorRodada[i] = []
        tempoPorRodada[i] = 0;
        tempoOciosoPorRodada[i] = 0;
        areaPorRodada[i]    = 0;
    }

    //Primeira chegada
    fila.push( new Pessoa( proximaChegada , -1 /*Rodada inexistente, pois ainda é fase transiente*/ ) );
    //document.writeln("Entrada: " + proximaChegada + "<br>" )
    proximaChegada = proximaChegada + gerador.exponential( lambda ); // Já agendamos a segunda chegada

    //------------------------------- INICIO DA SIMULACAO ------------------------------------
    while ( 
        rodadaAtual < numeroTotalRodadas || // Continuar enquanto rodadaAtual não for suficiente
        saintesPosTransiente < entrantesPosTransiente // Garante que todos que entraram e foram contabilizados na entrada saiam
    )
    {
        // Como eventoAtual vai ser atualizado, guardamos eventoAnterior pra auxiliar no calculo da area do grafico
        var eventoAnterior = eventoAtual ;

        //Caso proximo evento seja de entrada:
        if( proximaChegada < proximaSaida ){
            eventoAtual = proximaChegada;
            //document.writeln("Entrada: " + eventoAtual + "<br>" )
            fila.push( new Pessoa( proximaChegada , rodadaAtual ) );
            proximaChegada = proximaChegada + gerador.exponential( lambda );
            //Se não esta em fase transiente, contabiliza entrante e atualizamos area:
            if( !emFaseTransiente && rodadaAtual < numeroTotalRodadas ){
                entrantesPosTransiente++;
                coletasPorRodada[rodadaAtual]++;
                areaPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length - 1 /*Numero de pessoas antes dessa chegada*/ );
                //Se é a unica pessoa atualmente no sistema, contabilizamos o periodo ocioso que esta finalizou
                if( fila.array.length == 1 ){
                    tempoOciosoPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior);
                }
                //Checa se fim da rodada, pra guardar duração desta.
                if( coletasPorRodada[rodadaAtual] >= numeroMinimoDeColetas ){
                    
                    var inicioRodadaAtual = tempoFimTransiente
                    for( i = 0 ; i < rodadaAtual ; i++ ){
                        inicioRodadaAtual += tempoPorRodada[i]
                    }
                    tempoPorRodada[rodadaAtual] = eventoAtual - inicioRodadaAtual
                    
                    rodadaAtual++
                } 
            }
        }

        //Caso proximo evento seja de saida:
        else {
            eventoAtual = proximaSaida;
            //document.writeln("Saida: " + eventoAtual + "<br>" )
            var pessoaSainte = fila.pop();
            pessoaSainte.tempoDeSaida = eventoAtual;
            
            //Se a fila passou a ficar vazia, proxima saida depende da proxima chegada
            if( fila.vazia() ){
                proximaSaida = proximaChegada + gerador.exponential( mi );
            }
            //Se a fila continua com gente, proxima saida depende do instante dessa ultima saida
            //Tambem aproveitamos para setar o tempo de chegada em servico da proxima pessoa
            else{
                proximaSaida = proximaSaida + gerador.exponential( mi );
                fila.array[0].tempoDeChegadaEmServico = eventoAtual;
            }
            
            //Se a fila está em fase transiente, analisamos se já podemos encerrar a fase:
            if( emFaseTransiente ){
                coletasEmFaseTransiente.push( pessoaSainte )
                //Se já finalizamos uma "rodada" transiente com K_min de coletas, avaliamos sua variancia
                if( coletasEmFaseTransiente.length >= numeroMinimoDeColetas ){
                    var variancia = varianciaTempoEmFila( coletasEmFaseTransiente )
                    
                    //Caso seja a primeira rodada transiente, ou a variância foi maior do que a última
                    //rodada transiente, começamos outra rodada transiente
                    if( true && (varianciaFaseTransiente == null || variancia >= varianciaFaseTransiente) ){
                        varianciaFaseTransiente = variancia
                        coletasEmFaseTransiente = []
                    }
                    //Caso a variancia da rodada transiente atual diminuiu em relação a anterior,
                    //consideramos a fase transiente finalizada
                    else{
                        emFaseTransiente = false
                        tempoFimTransiente = eventoAtual
                        rodadaAtual = 0
                    }
                }
            }

            //Se a pessoa entrou pós fase transiente, contabiliza na coleta da rodada dela 
            else if( pessoaSainte.rodada >= 0 &&  pessoaSainte.rodada < numeroTotalRodadas ){
                pessoasPorRodada[ pessoaSainte.rodada ].push( pessoaSainte )
                areaPorRodada[rodadaAtual] += (eventoAtual - eventoAnterior)*( fila.array.length + 1 /*Numero de pessoas antes dessa saida*/ )
                saintesPosTransiente++
            }

        }

    }
    //------------------------------------- FIM DA SIMULACAO ---------------------------------------


    //  Resultados que queremos da simulacao
    var     tempoMedioPorRodada = [];
    var     numeroMedioPorRodada = [];
    var     taxaDeUtilizacaoPorRodada = [];

    // Calculo das variaveis estatisticas
    var summtemp = 0.0;
    var sumvtemp = 0.0;
    var summnum = 0.0;
    var sumvnum = 0.0;
    for( r = 0 ; r < numeroTotalRodadas ; r++ ){
        
        // Calculo do tempo medio por rodada. Media do tempo de estadia para cada pessoa
        $("#data").append("<h2>Rodada "+ r + "</h2>");
        var tabelaRodada = "<table border='1'>";

        tempoMedioPorRodada[r] = mediaTempoEmFila( pessoasPorRodada[r] )
        tabelaRodada+="<tr><td>Tempo Médio de Serviço</td><td>"+tempoMedioPorRodada[r]+"</td></tr>";
        addDataToGraph({y : tempoMedioPorRodada[r], x : r}, tempoMedioPorRodadaData, window.tempoMedioPorRodadaChart);

        //Calculo do numero medio de pessoas por rodada
        numeroMedioPorRodada[r] = areaPorRodada[r] / pessoasPorRodada[r].length
        tabelaRodada+="<tr><td>Número Médio de Pessoas</td><td>"+numeroMedioPorRodada[r]+"</td></tr>";
        addDataToGraph({y : numeroMedioPorRodada[r],x : r}, numeroMedioPorRodadaData, window.numeroMedioPorRodadaChart);

        //Calculo da taxa de utilizacao por rodada:
        taxaDeUtilizacaoPorRodada[r] = (tempoPorRodada[r] - tempoOciosoPorRodada[r]) / tempoPorRodada[r]
        tabelaRodada+="<tr><td>Taxa de Utilização</td><td>"+taxaDeUtilizacaoPorRodada[r]+"</td></tr>";
        addDataToGraph({y : taxaDeUtilizacaoPorRodada[r],x : r}, taxaDeUtilizacaoPorRodadaData, window.taxaDeUtilizacaoPorRodadaChart);

        // tabelaRodada+="<tr><td>Duração</td><td>"+duracaoRodadas[r]+"</td></tr>";
        // tabelaRodada+="<tr><td>Tempo Ocioso</td><td>"+tempoOciosoPorRodada[r]+"</td></tr>";

        tabelaRodada += "</table><br><br><br>";
        $("#data").append(tabelaRodada);

        //$("#data").append( "duracaoRodada(rodada " + r + "):......." + tempoPorRodada[r] + "<br>")
        //$("#data").append( "tempoOcioso(rodada " + r + "):.........." + tempoOciosoPorRodada[r] + "<br>")
        //$("#data").append( "<br><br><br>")
        summtemp = Number(summtemp) + Number(tempoMedioPorRodada[r]);
        summnum = Number(summnum) + Number(numeroMedioPorRodada[r]);
    }    
    for( r = 0 ; r < numeroTotalRodadas ; r++ ){
        sumvtemp = Number(sumvtemp) + Number(Math.pow((tempoMedioPorRodada[r] - summtemp/numeroTotalRodadas), 2));
        sumvnum = Number(sumvnum) + Number(Math.pow((numeroMedioPorRodada[r] - sumvnum/numeroTotalRodadas), 2));
    }
    var icmtemp = ICmedia(summtemp/numeroTotalRodadas, numeroTotalRodadas, sumvtemp/(numeroTotalRodadas-1));
    var icvtemp = ICvariancia(summtemp/numeroTotalRodadas, numeroTotalRodadas, sumvtemp/(numeroTotalRodadas-1))
    var icmnum = ICmedia(summnum/numeroTotalRodadas, numeroTotalRodadas, sumvnum/(numeroTotalRodadas-1));
    var icvnum = ICvariancia(summtemp/numeroTotalRodadas, numeroTotalRodadas, sumvtemp/(numeroTotalRodadas-1));
    //addIC(numeroMedioPorRodadaData, window.numeroMedioPorRodadaChart, icmnum[0], icmnum[1]);
    //console.log(icmnum)

}

